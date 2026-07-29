'use server';

import { db } from '@/lib/firebase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, limit, getDoc, runTransaction } from 'firebase/firestore';

const ALLOWED_PASSWORDS = [
  process.env.PRIMARY_PASSWORD || 'kira123',
  'megadevs-8181devmode',
  'alwalid-2211'
];

export async function login(formData: FormData) {
  const name = formData.get('name') as string;
  const password = formData.get('password') as string;

  if (!ALLOWED_PASSWORDS.includes(password)) {
    return { error: 'Invalid primary password' };
  }

  if (!name || name.trim() === '') {
    return { error: 'Name is required' };
  }

  const cookieStore = await cookies();
  cookieStore.set('worker_name', name.trim(), { httpOnly: true, path: '/' });

  redirect('/');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('worker_name');
  redirect('/login');
}

export async function getWorkerName() {
  const cookieStore = await cookies();
  return cookieStore.get('worker_name')?.value || null;
}

export async function getProducts() {
  try {
    const q = query(collection(db, 'products'), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    const products: { id: string; name: string; amount: number }[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({ id: doc.id, name: data.name, amount: data.amount });
    });
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getLogs() {
  try {
    const q = query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);
    const logs: { id: string; worker_name: string; action: string; product_name: string; quantity: number; timestamp: string }[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      logs.push({ 
        id: doc.id, 
        worker_name: data.worker_name, 
        action: data.action, 
        product_name: data.product_name, 
        quantity: data.quantity, 
        timestamp: data.timestamp 
      });
    });
    return logs;
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
}

export async function addProduct(formData: FormData) {
  const workerName = await getWorkerName();
  if (!workerName) return { error: 'Unauthorized' };

  const name = formData.get('name') as string;
  const amountStr = formData.get('amount') as string;
  const amount = parseInt(amountStr, 10);

  if (!name || isNaN(amount) || amount <= 0) {
    return { error: 'Invalid product name or amount' };
  }

  try {
    // Check if product already exists
    const q = query(collection(db, 'products'));
    const querySnapshot = await getDocs(q);
    const exists = querySnapshot.docs.some(doc => doc.data().name.toLowerCase() === name.toLowerCase());
    
    if (exists) {
      return { error: 'Product already exists. Please update the amount instead.' };
    }

    await addDoc(collection(db, 'products'), {
      name,
      amount
    });

    await addDoc(collection(db, 'logs'), {
      worker_name: workerName,
      action: 'ADDED',
      product_name: name,
      quantity: amount,
      timestamp: new Date().toISOString()
    });

    revalidatePath('/');
  } catch (error: any) {
    console.error("Database error:", error);
    return { error: 'Database error' };
  }
}

export async function updateProductAmount(id: string, quantityChange: number) {
  const workerName = await getWorkerName();
  if (!workerName) return { error: 'Unauthorized' };

  if (quantityChange === 0) return { error: 'No change in quantity' };

  try {
    const productRef = doc(db, 'products', id);
    
    // Using transaction to ensure atomic updates
    await runTransaction(db, async (transaction) => {
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists()) {
        throw new Error('Product not found');
      }
      
      const productData = productDoc.data();
      const newAmount = productData.amount + quantityChange;
      
      if (newAmount < 0) {
        throw new Error('Insufficient stock');
      }

      transaction.update(productRef, { amount: newAmount });
      
      // We can also add log inside or outside transaction. 
      // Firestore transactions don't support writes to collections dynamically inside unless we use a specific doc ref.
      // But we can just create a new doc ref for the log.
      const logRef = doc(collection(db, 'logs'));
      const action = quantityChange > 0 ? 'ADDED' : 'DELETED';
      transaction.set(logRef, {
        worker_name: workerName,
        action: action,
        product_name: productData.name,
        quantity: Math.abs(quantityChange),
        timestamp: new Date().toISOString()
      });
    });

    revalidatePath('/');
  } catch (error: any) {
    console.error("Update error:", error);
    if (error.message === 'Product not found' || error.message === 'Insufficient stock') {
      return { error: error.message };
    }
    return { error: 'Database error' };
  }
}

export async function deleteProduct(id: string) {
  const workerName = await getWorkerName();
  if (!workerName) return { error: 'Unauthorized' };

  try {
    const productRef = doc(db, 'products', id);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) {
      return { error: 'Product not found' };
    }
    
    const productData = productSnap.data();

    await deleteDoc(productRef);

    await addDoc(collection(db, 'logs'), {
      worker_name: workerName,
      action: 'DELETED',
      product_name: productData.name,
      quantity: productData.amount,
      timestamp: new Date().toISOString()
    });

    revalidatePath('/');
  } catch (error) {
    console.error("Delete error:", error);
    return { error: 'Database error' };
  }
}
