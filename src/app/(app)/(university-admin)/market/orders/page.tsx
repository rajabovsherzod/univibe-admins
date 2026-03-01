import { OrdersClient } from './_components/orders-client';

export const metadata = {
  title: 'Buyurtmalar | Univibe Admin',
  description: 'Talabalar do\'kondan qilgan barcha buyurtmalari ro\'yxati.',
};

export default function OrdersPage() {
  return <OrdersClient />;
}
