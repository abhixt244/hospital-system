'use client';

import { FileDown } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';

export default function PDFGenerator({ patient }) {
  const generatePDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header background
    doc.setFillColor(20, 30, 48);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Hospital name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('MedAlloc Hospital', pageWidth / 2, 18, { align: 'center' });

    // Subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Hospital Bed & Resource Allocation System', pageWidth / 2, 26, { align: 'center' });

    // Document title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DISCHARGE SUMMARY', pageWidth / 2, 36, { align: 'center' });

    let yPos = 55;

    // Patient Information
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information', 14, yPos);
    yPos += 4;

    doc.autoTable({
      startY: yPos,
      theme: 'grid',
      headStyles: { fillColor: [30, 60, 90], textColor: 255, fontStyle: 'bold', fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } },
      body: [
        ['Patient Name', patient.name],
        ['Age', `${patient.age} years`],
        ['Gender', patient.gender],
        ['Contact', patient.contact],
      ],
      margin: { left: 14, right: 14 },
    });

    yPos = doc.lastAutoTable.finalY + 12;

    // Admission Details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Admission Details', 14, yPos);
    yPos += 4;

    doc.autoTable({
      startY: yPos,
      theme: 'grid',
      headStyles: { fillColor: [30, 60, 90], textColor: 255, fontStyle: 'bold', fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } },
      body: [
        ['Admitted On', patient.admittedAt ? formatDateTime(patient.admittedAt) : 'N/A'],
        ['Discharged On', patient.dischargedAt ? formatDateTime(patient.dischargedAt) : 'N/A'],
        ['Attending Doctor', patient.doctor || 'N/A'],
        ['Ward', patient.bed?.ward?.name || 'N/A'],
        ['Bed Number', patient.bed?.bedNumber || 'N/A'],
        ['Priority', patient.priority],
        ['Status', patient.status],
      ],
      margin: { left: 14, right: 14 },
    });

    yPos = doc.lastAutoTable.finalY + 12;

    // Diagnosis
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnosis', 14, yPos);
    yPos += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const diagLines = doc.splitTextToSize(patient.diagnosis || 'N/A', pageWidth - 28);
    doc.text(diagLines, 14, yPos);
    yPos += diagLines.length * 6 + 8;

    // Notes
    if (patient.notes) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Clinical Notes', 14, yPos);
      yPos += 8;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const noteLines = doc.splitTextToSize(patient.notes, pageWidth - 28);
      doc.text(noteLines, 14, yPos);
      yPos += noteLines.length * 6 + 8;
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text(`Generated on: ${formatDateTime(new Date())}`, 14, footerY);
    doc.text('This is a computer-generated document.', pageWidth - 14, footerY, { align: 'right' });

    // Save
    const safeName = patient.name.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`discharge_summary_${safeName}.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 16px', borderRadius: '8px',
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-glass)',
        color: 'var(--text-primary)',
        fontSize: '13px', fontWeight: '500', cursor: 'pointer',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--accent-teal)';
        e.currentTarget.style.background = 'var(--bg-glass-hover)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-glass)';
        e.currentTarget.style.background = 'var(--bg-glass)';
      }}
    >
      <FileDown size={15} />
      Download PDF
    </button>
  );
}
