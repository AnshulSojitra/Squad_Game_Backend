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
  gstPercentage = 18,
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

      const invoicePath = path.join(
        __dirname,
        `../invoices/invoice-${bookingId}.pdf`,
      );

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(invoicePath);
      doc.pipe(stream);

      // HEADER

      doc.fontSize(24).fillColor("#111827").text("BoxArena", { align: "left" });

      doc
        .fontSize(10)
        .fillColor("#6b7280")
        .text("Sports Ground Booking Platform");

      doc.moveDown(1);

      doc.fontSize(18).fillColor("#111827").text("INVOICE", { align: "right" });

      doc
        .fontSize(10)
        .fillColor("#6b7280")
        .text(`Invoice No: BA-${bookingId}`, { align: "right" })
        .text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });

      doc.moveDown(2);

      // BILL TO SECTION

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

      // BOOKING DETAILS

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

      doc.moveDown(1.5);

      // TABLE HEADER

      doc
        .fontSize(12)
        .fillColor("#111827")
        .text("Slot", 50)
        .text("Time", 200)
        .text("Price", 450);

      doc
        .moveTo(50, doc.y + 5)
        .lineTo(550, doc.y + 5)
        .strokeColor("#d1d5db")
        .stroke();

      doc.moveDown();

      let subtotal = 0;

      slots.forEach((slot, index) => {
        const y = doc.y;

        doc
          .fontSize(11)
          .fillColor("#374151")
          .text(`${index + 1}`, 50, y)
          .text(
            `${to12Hour(slot.startTime)} - ${to12Hour(slot.endTime)}`,
            200,
            y,
          )
          .text(`Rs.${pricePerSlot}`, 450, y);

        subtotal += pricePerSlot;
        doc.moveDown();
      });

      doc.moveDown();

      // TOTALS SECTION

      const gstAmount = (subtotal * gstPercentage) / 100;
      const total = subtotal + gstAmount;

      doc.moveDown();
      doc.moveTo(300, doc.y).lineTo(550, doc.y).strokeColor("#d1d5db").stroke();
      doc.moveDown();

      // Right aligned numbers
      doc
        .fontSize(11)
        .fillColor("#374151")
        .text(`Subtotal: Rs.${subtotal.toFixed(2)}`, { align: "right" })
        .text(`GST (${gstPercentage}%): Rs.${gstAmount.toFixed(2)}`, {
          align: "right",
        });

      doc.moveDown(0.8);

      // Save Y position
      const totalY = doc.y;

      // Draw background box properly
      doc.rect(300, totalY - 5, 250, 30).fill("#ecfdf5");

      // Write total inside box
      doc
        .fillColor("#065f46")
        .fontSize(13)
        .text(`Total Payable: Rs.${total.toFixed(2)}`, 310, totalY + 3);

      doc.moveDown(3);

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
