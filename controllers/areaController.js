// const Area = require("../models/Area");

// // CREATE area
// exports.createArea = async (req, res) => {
//   try {
//     const area = await Area.create(req.body);
//     res.status(201).json(area);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // GET all areas
// exports.getAreas = async (req, res) => {
//   try {
//     const areas = await Area.find();
//     res.json(areas);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // UPDATE area
// exports.updateArea = async (req, res) => {
//   try {
//     const area = await Area.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     res.json(area);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // DELETE area
// exports.deleteArea = async (req, res) => {
//   try {
//     await Area.findByIdAndDelete(req.params.id);
//     res.json({ message: "Area deleted" });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };
