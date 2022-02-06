'use strict';

const { sanitizeEntity } = require("strapi-utils/lib");

const stripe = require("stripe")(process.env.STRIPE_KEY)


module.exports = {
  createPaymentIntent: async (ctx) => {
    const { cart } = ctx.request.body;

    const games = await strapi.config.functions.cart.cartItems(cart)

    if(!games.length) {
      ctx.response.status = 404
      return {
        error: 'No valid games found'
      }
    };

    const total = await strapi.config.functions.cart.cartTotal(games)

    if(total === 0) {
      return {
        freeGames: true
      }
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total ,
        currency: "eur",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent
    } catch (err) {
      return {
        error: err.raw.message,

      }
    }
  },

  create: async (ctx) => {
    // pegar as informações do frontend
    const { cart, paymentIntentId, paymentMethod } = ctx.request.body;

    // pego o token
    const token = await strapi.plugins["users-permissions"].services.jwt.getToken(ctx);

    // pegando o id do usuario
    const userId = token.id;

    // pegando as informações do usuario pelo id
    const userInfo = await strapi.query("user", "users-permissions").findOne({ id: userId});

    // pegar os jogos

    const games = await strapi.config.functions.cart.cartItems(cart)

    // pegar o total (saber se é free ou nao)
    const total_in_cents = await strapi.config.functions.cart.cartTotal(games)

    // pegar o paymentIntentId
    // pegar as infromações do pagamento (paymentMethod)

    // salvar no banco
    // pego a estrutura de orders no contentType do strapi e monto os filds passando os dados recebidos
    const entry = {
      total_in_cents,
      payment_intent_id: paymentIntentId,
      card_brand: null,
      card_last4: null,
      user: userInfo,
      games
    }

    //agora faço a criação com os dados acima
    const entity = await strapi.services.order.create(entry)

    // enviar um email de compra para o usuario

    return sanitizeEntity(entity, {model: strapi.models.order})
  }
};
