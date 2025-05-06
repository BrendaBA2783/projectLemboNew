/**
 * Utilities for generating Excel and PDF reports
 */

/**
 * Generate an Excel report
 * @param {Array} data - Data to include in the report
 * @param {Array} headers - Column headers
 * @param {string} title - Report title
 * @param {string} filename - Output filename
 */
function generateExcelReport(data, headers, title, filename) {
  try {
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(title);
    
    // Add title
    worksheet.mergeCells('A1:' + String.fromCharCode(64 + headers.length) + '1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = title;
    titleCell.font = {
      bold: true,
      size: 16
    };
    titleCell.alignment = {
      horizontal: 'center'
    };
    
    // Add headers
    const headerRow = worksheet.addRow(headers.map(h => h.header));
    headerRow.eachCell((cell) => {
      cell.font = {
        bold: true
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Add data rows
    data.forEach(item => {
      const values = headers.map(header => {
        let value = item[header.key];
        
        // Format date fields
        if (header.type === 'date' && value) {
          value = formatDate(value);
        }
        
        // Format currency fields
        else if (header.type === 'currency' && value !== undefined && value !== null) {
          value = parseFloat(value);
        }
        
        // Format number fields
        else if (header.type === 'number' && value !== undefined && value !== null) {
          value = parseFloat(value);
        }
        
        return value;
      });
      
      worksheet.addRow(values);
    });
    
    // Auto size columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(maxLength + 2, 50);
    });
    
    // Generate file and trigger download
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.xlsx`;
      a.click();
      
      window.URL.revokeObjectURL(url);
    });
    
    showToast('Reporte Excel generado exitosamente', 'success');
  } catch (error) {
    console.error('Error generating Excel report:', error);
    showToast('Error al generar reporte Excel', 'error');
  }
}

/**
 * Generate a PDF report
 * @param {Array} data - Data to include in the report
 * @param {Array} headers - Column headers
 * @param {string} title - Report title
 * @param {string} filename - Output filename
 * @param {boolean} landscape - Whether to use landscape orientation
 */
function generatePdfReport(data, headers, title, filename, landscape = false) {
  try {
    // Initialize jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: landscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add title
    doc.setFontSize(16);
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generado: ${formatDate(new Date())}`, doc.internal.pageSize.getWidth() - 20, 10, { align: 'right' });
    
    // Prepare table data
    const tableHeaders = headers.map(h => h.header);
    const tableData = data.map(item => {
      return headers.map(header => {
        let value = item[header.key];
        
        // Format date fields
        if (header.type === 'date' && value) {
          value = formatDate(value);
        }
        
        // Format currency fields
        else if (header.type === 'currency' && value !== undefined && value !== null) {
          value = formatCurrency(value);
        }
        
        // Format number fields
        else if (header.type === 'number' && value !== undefined && value !== null) {
          value = formatNumber(value);
        }
        
        // Format state fields
        else if (header.key === 'estado') {
          value = value === 'activo' ? 'Activo' : 'Inactivo';
        }
        
        return value || '';
      });
    });
    
    // Generate table
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 25,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [46, 125, 50],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      margin: { top: 25 }
    });
    
    // Add page number
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }
    
    // Save the document
    doc.save(`${filename}.pdf`);
    
    showToast('Reporte PDF generado exitosamente', 'success');
  } catch (error) {
    console.error('Error generating PDF report:', error);
    showToast('Error al generar reporte PDF', 'error');
  }
}

/**
 * Generate a chart report for sensor readings
 * @param {string} containerId - Container element ID for the chart
 * @param {Array} data - Sensor reading data
 * @param {string} sensorName - Sensor name
 * @param {string} unit - Measurement unit
 */
function generateSensorChart(containerId, data, sensorName, unit) {
  const container = document.getElementById(containerId);
  if (!container || !data || !data.length) return;
  
  // Prepare data for chart
  const labels = data.map(item => formatDate(item.fecha));
  const values = data.map(item => parseFloat(item.valor));
  
  // Create canvas if it doesn't exist
  let canvas = container.querySelector('canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    container.appendChild(canvas);
  }
  
  // Check if a chart instance already exists and destroy it
  if (container.chart) {
    container.chart.destroy();
  }
  
  // Create chart
  container.chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `${sensorName} (${unit})`,
        data: values,
        borderColor: CONFIG.CHART_COLORS[0],
        backgroundColor: `${CONFIG.CHART_COLORS[0]}33`,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5
      }]
    },
    options: {
      ...CONFIG.DEFAULT_CHART_OPTIONS,
      scales: {
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: unit
          }
        }
      },
      plugins: {
        ...CONFIG.DEFAULT_CHART_OPTIONS.plugins,
        title: {
          display: true,
          text: `Lecturas de ${sensorName}`,
          font: {
            size: 16
          }
        }
      }
    }
  });
}

/**
 * Generate bar chart for various statistics
 * @param {string} containerId - Container element ID for the chart
 * @param {Array} data - Data for the chart
 * @param {string} title - Chart title
 * @param {Object} options - Additional chart options
 */
function generateBarChart(containerId, data, labels, title, options = {}) {
  const container = document.getElementById(containerId);
  if (!container || !data || !data.length) return;
  
  // Create canvas if it doesn't exist
  let canvas = container.querySelector('canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    container.appendChild(canvas);
  }
  
  // Check if a chart instance already exists and destroy it
  if (container.chart) {
    container.chart.destroy();
  }
  
  // Default options
  const defaultOptions = {
    type: 'bar',
    yAxisLabel: '',
    xAxisLabel: '',
    colors: CONFIG.CHART_COLORS
  };
  
  // Merge options
  const chartOptions = { ...defaultOptions, ...options };
  
  // Create datasets from data
  const datasets = [];
  
  if (Array.isArray(data[0])) {
    // Multi-series data
    data.forEach((series, index) => {
      datasets.push({
        label: options.seriesLabels ? options.seriesLabels[index] : `Serie ${index + 1}`,
        data: series,
        backgroundColor: chartOptions.colors[index % chartOptions.colors.length],
        borderColor: chartOptions.colors[index % chartOptions.colors.length],
        borderWidth: 1
      });
    });
  } else {
    // Single series data
    datasets.push({
      label: title,
      data: data,
      backgroundColor: chartOptions.colors[0],
      borderColor: chartOptions.colors[0],
      borderWidth: 1
    });
  }
  
  // Create chart
  container.chart = new Chart(canvas, {
    type: chartOptions.type,
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      ...CONFIG.DEFAULT_CHART_OPTIONS,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: !!chartOptions.yAxisLabel,
            text: chartOptions.yAxisLabel
          }
        },
        x: {
          title: {
            display: !!chartOptions.xAxisLabel,
            text: chartOptions.xAxisLabel
          }
        }
      },
      plugins: {
        ...CONFIG.DEFAULT_CHART_OPTIONS.plugins,
        title: {
          display: true,
          text: title,
          font: {
            size: 16
          }
        }
      }
    }
  });
}

/**
 * Generate a pie/doughnut chart
 * @param {string} containerId - Container element ID for the chart
 * @param {Array} data - Data values
 * @param {Array} labels - Data labels
 * @param {string} title - Chart title
 * @param {string} type - Chart type ('pie' or 'doughnut')
 */
function generatePieChart(containerId, data, labels, title, type = 'pie') {
  const container = document.getElementById(containerId);
  if (!container || !data || !data.length) return;
  
  // Create canvas if it doesn't exist
  let canvas = container.querySelector('canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    container.appendChild(canvas);
  }
  
  // Check if a chart instance already exists and destroy it
  if (container.chart) {
    container.chart.destroy();
  }
  
  // Create chart
  container.chart = new Chart(canvas, {
    type: type,
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: CONFIG.CHART_COLORS.slice(0, data.length),
        borderWidth: 1
      }]
    },
    options: {
      ...CONFIG.DEFAULT_CHART_OPTIONS,
      plugins: {
        ...CONFIG.DEFAULT_CHART_OPTIONS.plugins,
        title: {
          display: true,
          text: title,
          font: {
            size: 16
          }
        }
      }
    }
  });
}