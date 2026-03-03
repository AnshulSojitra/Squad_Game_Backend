const cron = require("node-cron");
const { Op } = require("sequelize");
const { Game, GameSlot, Slot } = require("../models");

const autoDeleteExpiredGames = () => {
  // Runs every minute
  cron.schedule("*/60 * * * * *", async () => {
    try {
      const now = new Date();

      const todayDate =
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0");

      // Delete games where date already passed
      await Game.destroy({
        where: {
          date: {
            [Op.lt]: todayDate,
          },
        },
      });

      // Handle today's games (check time)
      const todaysGames = await Game.findAll({
        where: {
          date: todayDate,
        },
        include: [
          {
            model: GameSlot,
            include: [
              {
                model: Slot,
                attributes: ["endTime"],
              },
            ],
          },
        ],
      });

      for (const game of todaysGames) {
        if (!game.GameSlots || game.GameSlots.length === 0) continue;

        // Get latest slot end time
        const endTimes = game.GameSlots.map((gs) => gs.Slot?.endTime).filter(
          Boolean,
        );

        if (endTimes.length === 0) continue;

        const latestEndTime = endTimes.sort().reverse()[0];

        const gameEndDateTime = new Date(`${todayDate}T${latestEndTime}`);

        if (now > gameEndDateTime) {
          await Game.destroy({ where: { id: game.id } });
          console.log(`🔥 Game ${game.id} auto-deleted (time passed)`);
        }
      }
    } catch (error) {
      console.error("❌ Auto-delete expired games error:", error);
    }
  });
};

module.exports = autoDeleteExpiredGames;
