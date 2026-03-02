const cron = require("node-cron");
const { Op } = require("sequelize");
const { Game } = require("../models");

const autoDeleteExpiredGames = () => {
  // Runs every 10 minutes
  cron.schedule("*/10 * * * * *", async () => {
    try {
      // Get today's date (local)
      const now = new Date();
      const today =
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0");

      // Find expired games
      const expiredGames = await Game.findAll({
        where: {
          date: {
            [Op.lt]: today,
          },
        },
        attributes: ["id"],
      });

      if (expiredGames.length === 0) return;

      const gameIds = expiredGames.map((g) => g.id);

      await Game.destroy({
        where: {
          id: gameIds,
        },
      });

      console.log(
        `🔥 ${gameIds.length} expired game(s) auto-deleted at ${new Date()}`,
      );
    } catch (error) {
      console.error("❌ Auto-delete expired games error:", error);
    }
  });
};

module.exports = autoDeleteExpiredGames;
