import Stripe from 'stripe'
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    console.log(req.body.cartItems)
    try {
      const params = {
        submit_type : 'pay',
        mode: 'payment',
        payment_method_types: ['card'],
        billing_address_collection: 'auto',
        shipping_address_collection: {allowed_countries: ['FR']},
        shipping_options: [
            { shipping_rate: 'shr_1M1IeTJpM42GLk7J0Eb6ESGY' },
            { shipping_rate: 'shr_1M1IfVJpM42GLk7J6Z6PVIoh' },
            
        ],
        line_items: req.body.map((item) => {
            const img = item.image[0].asset._ref;
            const newImage = img.replace('image-', 'https://cdn.sanity.io/images/xxe6wa5s/production/').replace('-webp', '.webp');
  
            return {
              price_data: { 
                currency: 'eur',
                product_data: { 
                  name: item.name,
                  images: [newImage],
                },
                unit_amount: item.price * 100,
              },
              adjustable_quantity: {
                enabled:true,
                minimum: 1,
              },
              quantity: item.quantity
            }
          }),
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/canceled`,
      };

      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create(params);
      res.status(200).json(session);
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
