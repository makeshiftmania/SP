// ✅ Active version: monetary-field-handler.js (Updated 12 May 2025, 00:59)

document.addEventListener("DOMContentLoaded", () => {
  const moneyInputs = document.querySelectorAll('input[data-money="true"]');

  moneyInputs.forEach(input => {
    input.addEventListener("input", () => {
      let val = input.value;

      // Strip non-numeric (allow one decimal)
      val = val.replace(/[^\d.]/g, "");

      // Limit to one decimal
      const parts = val.split(".");
      if (parts.length > 2) {
        val = parts[0] + "." + parts[1];
      }

      // Limit to 2 decimal places
      if (parts[1]?.length > 2) {
        val = parts[0] + "." + parts[1].slice(0, 2);
      }

      // Limit max to 500.00
      const floatVal = parseFloat(val);
      if (!isNaN(floatVal) && floatVal > 100) {
        val = "500.00";
      }

      input.value = val;
    });

    input.addEventListener("blur", () => {
      const val = parseFloat(input.value);
      if (!isNaN(val)) {
        input.value = val.toFixed(2);
      }
    });
  });
});