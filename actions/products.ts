'use server';

import { connectDB } from '@/lib/db';
import { Product } from '@/models/Product';
import { revalidatePath } from 'next/cache';

export async function submitProductReview(
  productId: string,
  reviewData: {
    reviewerName: string;
    rating: number;
    comment: string;
  }
) {
  try {
    if (!reviewData.reviewerName || !reviewData.comment || !reviewData.rating) {
      return { success: false, message: 'يرجى ملء جميع حقول التقييم المطلوبة.' };
    }

    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return { success: false, message: 'التقييم يجب أن يكون بين 1 و 5 نجوم.' };
    }

    await connectDB();

    const product = await Product.findById(productId);
    if (!product) {
      return { success: false, message: 'المنتج غير موجود.' };
    }

    // Add review
    product.reviews.push({
      reviewerName: reviewData.reviewerName.trim(),
      rating: Math.round(reviewData.rating),
      comment: reviewData.comment.trim(),
      createdAt: new Date(),
    });

    await product.save();

    revalidatePath(`/product/${productId}`);
    revalidatePath('/');
    
    return { success: true, message: 'تم إضافة مراجعتك بنجاح وسوف تظهر فوراً!' };
  } catch (error: any) {
    console.error('Error submitting product review:', error);
    return { success: false, message: 'حدث خطأ غير متوقع أثناء إرسال المراجعة.' };
  }
}
