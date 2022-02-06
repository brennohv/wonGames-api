'use strict';

const stripe = require("stripe")(process.env.STRIPE_KEY)


module.exports = {
  createPaymentIntent: async (ctx) => {
    const { cart } = ctx.request.body;

    let games = [];

    await Promise.all(
      cart?.map(async (game) => {
        const validatedGame = await strapi.services.game.findOne({
          id: game.id,
        });

        if (validatedGame) {
          games.push(validatedGame);
        }
      })
    );

    if(!games.length) {
      ctx.response.status = 404
      return {
        error: 'No valid games found'
      }
    };

    const total = games.reduce((acc, game) => {
      return acc + game.price
    }, 0);

    if(total === 0) {
      return {
        freeGames: true
      }
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total * 100,
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
    // pegar o total (saber se é free ou nao)
    // pegar o paymentIntentId
    // pegar as infromações do pagamento (paymentMethod)
    // salvar no banco
    // enviar um email de compra para o usuario

    return {cart, paymentIntentId, paymentMethod, userInfo}
  }
};
