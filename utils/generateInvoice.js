const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoice = ({
  bookingId,
  user,
  groundName,
  date,
  slots,
  pricePerSlot,
  gstPercentage,
}) => {
  return new Promise((resolve, reject) => {
    try {
      const to12Hour = (time24) => {
        if (!time24) return "";
        const [hourStr, minute] = time24.split(":");
        let hour = parseInt(hourStr, 10);
        const period = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12;
        return `${hour}:${minute} ${period}`;
      };

      const invoiceDir = path.join(__dirname, "../invoices");
      if (!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir);
      }

      const invoicePath = path.join(invoiceDir, `invoice-${bookingId}.pdf`);

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(invoicePath);
      doc.pipe(stream);

      // HEADER
      doc.fontSize(24).fillColor("#111827").text("BoxArena");

      doc
        .fontSize(10)
        .fillColor("#6b7280")
        .text("Sports Ground Booking Platform");

      doc.moveDown();

      doc.fontSize(18).fillColor("#111827").text("INVOICE", { align: "right" });

      doc
        .fontSize(10)
        .fillColor("#6b7280")
        .text(`Invoice No: BA-${bookingId}`, { align: "right" })
        .text(`Date: ${new Date().toLocaleDateString()}`, {
          align: "right",
        });

      doc.moveDown(2);

      // BILL TO
      doc
        .fontSize(12)
        .fillColor("#111827")
        .text("Billed To:", { underline: true });

      doc.moveDown(0.5);

      doc
        .fontSize(11)
        .fillColor("#374151")
        .text(`Name: ${user.name}`)
        .text(`Email: ${user.email}`);

      doc.moveDown(2);

      // BOOKING INFO
      doc
        .fontSize(12)
        .fillColor("#111827")
        .text("Booking Details:", { underline: true });

      doc.moveDown(0.5);

      doc
        .fontSize(11)
        .fillColor("#374151")
        .text(`Ground: ${groundName}`)
        .text(`Booking Date: ${date}`);

      doc.moveDown(2);

      // TABLE

      const tableLeft = 50;
      const tableWidth = 500;
      const rowHeight = 25;

      let y = doc.y;

      // Header background
      doc.rect(tableLeft, y, tableWidth, rowHeight).fill("#f3f4f6");

      doc
        .fillColor("#111827")
        .fontSize(12)
        .text("No.", tableLeft + 10, y + 7)
        .text("Time Slot", tableLeft + 70, y + 7)
        .text("Price", tableLeft + 350, y + 7)
        .text("Net Price", tableLeft + 430, y + 7);

      y += rowHeight;

      let subtotal = 0;

      // Rows
      slots.forEach((slot, index) => {
        const slotTime = `${to12Hour(
          slot.startTime,
        )} - ${to12Hour(slot.endTime)}`;

        doc.rect(tableLeft, y, tableWidth, rowHeight).stroke("#e5e7eb");
        const gsAmount = pricePerSlot + (pricePerSlot * gstPercentage) / 100;
        doc
          .fillColor("#374151")
          .fontSize(11)
          .text(index + 1, tableLeft + 10, y + 7)
          .text(slotTime, tableLeft + 70, y + 7)
          .text(`Rs.${pricePerSlot}`, tableLeft + 350, y + 7)

          .text(`Rs.${gsAmount}`, tableLeft + 430, y + 7);

        subtotal += pricePerSlot;
        y += rowHeight;
      });

      doc.moveDown(3);

      // TOTALS

      const gstAmount = (subtotal * gstPercentage) / 100;
      const total = subtotal + gstAmount;

      const totalsX = 330;
      let totalsY = y + 10;

      doc
        .fontSize(11)
        .fillColor("#374151")
        .text("Subtotal:", totalsX, totalsY)
        .text(`Rs.${subtotal.toFixed(2)}`, totalsX + 120, totalsY);

      totalsY += 20;

      doc
        .text(`GST (${gstPercentage}%):`, totalsX, totalsY)
        .text(`Rs.${gstAmount.toFixed(2)}`, totalsX + 120, totalsY);

      totalsY += 30;

      // Total highlight box
      doc.rect(totalsX - 10, totalsY - 5, 210, 30).fill("#ecfdf5");

      doc
        .fillColor("#065f46")
        .fontSize(13)
        .text("Total Payable:", totalsX, totalsY + 5)
        .text(`Rs.${total.toFixed(2)}`, totalsX + 120, totalsY + 5);

      doc.moveDown(4);

      // FOOTER

      doc
        .fontSize(10)
        .fillColor("#6b7280")
        .text(
          "Thank you for choosing BoxArena. We look forward to serving you again.",
          { align: "center" },
        );

      doc.end();

      stream.on("finish", () => resolve(invoicePath));
      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generateInvoice;

// const PDFDocument = require("pdfkit");
// const cloudinary = require("../config/cloudinary");
// const streamifier = require("streamifier");

// const generateInvoice = async ({
//   bookingId,
//   user,
//   groundName,
//   date,
//   slots,
//   pricePerSlot,
//   gstPercentage = 18,
// }) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const doc = new PDFDocument({ margin: 50 });

//       const buffers = [];
//       doc.on("data", buffers.push.bind(buffers));

//       doc.on("end", async () => {
//         try {
//           const pdfBuffer = Buffer.concat(buffers);

//           const result = await new Promise((resolve, reject) => {
//             const uploadStream = cloudinary.uploader.upload_stream(
//               {
//                 folder: "invoices",
//                 resource_type: "raw",
//                 public_id: `invoice-${bookingId}`,
//               },
//               (error, result) => {
//                 if (error) return reject(error);
//                 resolve(result);
//               },
//             );

//             streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
//           });

//           resolve(result.secure_url);
//         } catch (err) {
//           reject(err);
//         }
//       });

//       const to12Hour = (time24) => {
//         if (!time24) return "";
//         const [hourStr, minute] = time24.split(":");
//         let hour = parseInt(hourStr, 10);
//         const period = hour >= 12 ? "PM" : "AM";
//         hour = hour % 12 || 12;
//         return `${hour}:${minute} ${period}`;
//       };

//       // HEADER
//       doc.fontSize(24).fillColor("#111827").text("BoxArena");

//       doc
//         .fontSize(10)
//         .fillColor("#6b7280")
//         .text("Sports Ground Booking Platform");

//       doc.moveDown();

//       doc.fontSize(18).fillColor("#111827").text("INVOICE", { align: "right" });

//       doc
//         .fontSize(10)
//         .fillColor("#6b7280")
//         .text(`Invoice No: BA-${bookingId}`, { align: "right" })
//         .text(`Date: ${new Date().toLocaleDateString()}`, {
//           align: "right",
//         });

//       doc.moveDown(2);

//       // BILL TO
//       doc
//         .fontSize(12)
//         .fillColor("#111827")
//         .text("Billed To:", { underline: true });

//       doc.moveDown(0.5);

//       doc
//         .fontSize(11)
//         .fillColor("#374151")
//         .text(`Name: ${user.name}`)
//         .text(`Email: ${user.email}`);

//       doc.moveDown(2);

//       // BOOKING INFO
//       doc
//         .fontSize(12)
//         .fillColor("#111827")
//         .text("Booking Details:", { underline: true });

//       doc.moveDown(0.5);

//       doc
//         .fontSize(11)
//         .fillColor("#374151")
//         .text(`Ground: ${groundName}`)
//         .text(`Booking Date: ${date}`);

//       doc.moveDown(2);

//       const tableLeft = 50;
//       const tableWidth = 500;
//       const rowHeight = 25;
//       let y = doc.y;

//       doc.rect(tableLeft, y, tableWidth, rowHeight).fill("#f3f4f6");

//       doc
//         .fillColor("#111827")
//         .fontSize(12)
//         .text("No.", tableLeft + 10, y + 7)
//         .text("Time Slot", tableLeft + 70, y + 7)
//         .text("Price", tableLeft + 350, y + 7)
//         .text("Net Price", tableLeft + 430, y + 7);

//       y += rowHeight;

//       let subtotal = 0;

//       slots.forEach((slot, index) => {
//         const slotTime = `${to12Hour(slot.startTime)} - ${to12Hour(
//           slot.endTime,
//         )}`;

//         doc.rect(tableLeft, y, tableWidth, rowHeight).stroke("#e5e7eb");

//         const gsAmount = pricePerSlot + (pricePerSlot * gstPercentage) / 100;

//         doc
//           .fillColor("#374151")
//           .fontSize(11)
//           .text(index + 1, tableLeft + 10, y + 7)
//           .text(slotTime, tableLeft + 70, y + 7)
//           .text(`Rs.${pricePerSlot}`, tableLeft + 350, y + 7)
//           .text(`Rs.${gsAmount}`, tableLeft + 430, y + 7);

//         subtotal += pricePerSlot;
//         y += rowHeight;
//       });

//       const gstAmount = (subtotal * gstPercentage) / 100;
//       const total = subtotal + gstAmount;

//       doc.moveDown(3);

//       doc.text(`Subtotal: Rs.${subtotal}`);
//       doc.text(`GST (${gstPercentage}%): Rs.${gstAmount}`);
//       doc.text(`Total: Rs.${total}`);

//       doc.moveDown(3);

//       doc
//         .fontSize(10)
//         .fillColor("#6b7280")
//         .text(
//           "Thank you for choosing BoxArena. We look forward to serving you again.",
//           { align: "center" },
//         );

//       doc.end();
//     } catch (error) {
//       reject(error);
//     }
//   });
// };

// module.exports = generateInvoice;
