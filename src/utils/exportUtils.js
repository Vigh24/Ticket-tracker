import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export const exportToPDF = async (tickets, dateRange = null) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('TicketTrack Pro - Tickets Report', 20, 30);

  // Add generation date and filter info
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`, 20, 45);

  if (dateRange && (dateRange.start || dateRange.end)) {
    let filterText = 'Filter: ';
    if (dateRange.start && dateRange.end) {
      filterText += `${format(dateRange.start, 'MMM dd, yyyy')} - ${format(dateRange.end, 'MMM dd, yyyy')}`;
    } else if (dateRange.start) {
      filterText += `From ${format(dateRange.start, 'MMM dd, yyyy')}`;
    } else if (dateRange.end) {
      filterText += `Until ${format(dateRange.end, 'MMM dd, yyyy')}`;
    }
    doc.text(filterText, 20, 55);
  }
  
  // Add summary statistics
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;
  const awaitingCount = tickets.filter(t => t.status === 'Awaiting Response').length;
  const successRate = tickets.length > 0 ? Math.round((resolvedCount / tickets.length) * 100) : 0;

  const summaryY = dateRange && (dateRange.start || dateRange.end) ? 75 : 65;

  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('Summary', 20, summaryY);

  doc.setFontSize(11);
  doc.text(`Total Tickets: ${tickets.length}`, 20, summaryY + 15);
  doc.text(`Resolved: ${resolvedCount}`, 20, summaryY + 25);
  doc.text(`Awaiting Response: ${awaitingCount}`, 20, summaryY + 35);
  doc.text(`Success Rate: ${successRate}%`, 20, summaryY + 45);
  
  // Prepare table data
  const tableData = tickets.map(ticket => [
    ticket.ticket_id,
    ticket.status,
    ticket.notes || 'No notes',
    format(new Date(ticket.created_at), 'MMM dd, yyyy'),
    format(new Date(ticket.updated_at), 'MMM dd, yyyy')
  ]);
  
  // Add table
  const tableStartY = dateRange && (dateRange.start || dateRange.end) ? 135 : 125;

  doc.autoTable({
    head: [['Ticket ID', 'Status', 'Notes', 'Created', 'Updated']],
    body: tableData,
    startY: tableStartY,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 35 },
      2: { cellWidth: 60 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
    },
    margin: { left: 20, right: 20 },
  });
  
  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - 40,
      doc.internal.pageSize.height - 10
    );
  }
  
  // Save the PDF
  const fileName = `tickets-report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
  doc.save(fileName);
};

export const exportToCSV = (tickets) => {
  // Prepare CSV headers
  const headers = ['Ticket ID', 'Status', 'Notes', 'Created Date', 'Updated Date'];
  
  // Prepare CSV data
  const csvData = tickets.map(ticket => [
    escapeCSVField(ticket.ticket_id),
    escapeCSVField(ticket.status),
    escapeCSVField(ticket.notes || ''),
    escapeCSVField(format(new Date(ticket.created_at), 'yyyy-MM-dd HH:mm:ss')),
    escapeCSVField(format(new Date(ticket.updated_at), 'yyyy-MM-dd HH:mm:ss'))
  ]);
  
  // Combine headers and data
  const csvContent = [headers, ...csvData]
    .map(row => row.join(','))
    .join('\n');
  
  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `tickets-export-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper function to escape CSV fields
const escapeCSVField = (field) => {
  if (field === null || field === undefined) {
    return '';
  }
  
  const stringField = String(field);
  
  // If field contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  
  return stringField;
};
