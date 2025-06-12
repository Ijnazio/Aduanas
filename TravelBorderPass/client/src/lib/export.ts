export function generatePDF(data: any, filename: string) {
  // Simulate PDF generation
  const content = `
    REPORTE DEL SISTEMA ADUANAS CHILE
    =================================
    
    Fecha de generación: ${new Date().toLocaleDateString('es-CL')}
    
    DATOS:
    ${JSON.stringify(data, null, 2)}
    
    ---
    Sistema de Modernización de Pasos Fronterizos
    Servicio Nacional de Aduanas de Chile
  `;
  
  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export function generateExcel(data: any, filename: string) {
  // Simulate Excel generation
  let csvContent = "data:text/csv;charset=utf-8,";
  
  if (Array.isArray(data) && data.length > 0) {
    // Add headers
    const headers = Object.keys(data[0]);
    csvContent += headers.join(",") + "\n";
    
    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => row[header] || "");
      csvContent += values.join(",") + "\n";
    });
  } else {
    csvContent += "No hay datos disponibles\n";
  }
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getReportTemplate(type: string) {
  const templates = {
    daily: {
      title: "Reporte Diario",
      fields: ["fecha", "cruces_personas", "cruces_vehiculos", "tiempo_promedio"],
    },
    monthly: {
      title: "Reporte Mensual",
      fields: ["mes", "total_cruces", "total_vehiculos", "eficiencia"],
    },
    annual: {
      title: "Reporte Anual",
      fields: ["año", "total_cruces", "total_vehiculos", "crecimiento"],
    },
    custom: {
      title: "Reporte Personalizado",
      fields: ["campo1", "campo2", "campo3"],
    },
  };
  
  return templates[type as keyof typeof templates] || templates.custom;
}
