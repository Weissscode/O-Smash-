import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

async function captureDashboardCanvas(el) {
  const origOverflow = el.style.overflowY;
  const origHeight = el.style.height;
  el.style.overflowY = 'visible';
  el.style.height = 'auto';
  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: '#F5F1FB',
    useCORS: true,
    windowWidth: el.scrollWidth,
    windowHeight: el.scrollHeight
  });
  el.style.overflowY = origOverflow;
  el.style.height = origHeight;
  return canvas;
}

export async function downloadDashboardPDF(el, dateStr) {
  const canvas = await captureDashboardCanvas(el);
  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;
  let heightLeft = imgH;
  let position = 0;
  pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
  heightLeft -= pageH;
  while (heightLeft > 0) {
    position = heightLeft - imgH;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
    heightLeft -= pageH;
  }
  pdf.save('dashboard-osmash-' + dateStr.replace(/\//g, '-') + '.pdf');
}
