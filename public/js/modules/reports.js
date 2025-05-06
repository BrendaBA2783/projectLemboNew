// insumoExcel.js
console.log('🔄 Loading InsumoExcel module...');

async function loadExcelJS() {
  if (window.ExcelJS) return Promise.resolve();
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function generateExcelReport(data, filename) {
  try {
    await loadExcelJS();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Insumos');

    // Add header row
    worksheet.addRow(['ID Insumo', 'Nombre', 'Tipo', 'Descripción', 'Estado']);

    // Add data rows
    data.forEach(insumo => {
      worksheet.addRow([
        insumo.id_insumo,
        insumo.nombre,
        insumo.tipo,
        insumo.descripcion || '-',
        insumo.estado === 'activo' ? 'Activo' : 'Inactivo'
      ]);
    });

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center' };

    // Auto width for columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const cellValue = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, cellValue.length);
      });
      column.width = maxLength + 2;
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.xlsx`;
    link.click();

    showToast('Reporte de Excel generado exitosamente', 'success');
  } catch (error) {
    console.error('Error generating Excel report:', error);
    showToast('Error al generar el reporte de Excel', 'error');
  }
}

window.generateExcelReport = generateExcelReport;