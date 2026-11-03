import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2, Table2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { downloadExport, EXPORT_RESOURCES, type ExportFormat } from '../../services/operations';
import { PageHeader } from '../../components/common/PageHeader';

type BusyKey = string | null;

export function ReportsPage() {
  const { showToast } = useToast();
  const [busy, setBusy] = useState<BusyKey>(null);

  async function handleExport(resource: string, format: ExportFormat) {
    const key = `${resource}:${format}`;
    setBusy(key);
    try {
      await downloadExport(resource, format);
      showToast(`Đã tải file ${format.toUpperCase()} thành công.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không tải được file.';
      showToast(message, 'error');
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="BÁO CÁO"
        title="Xuất báo cáo & tài liệu"
        description="Tải dữ liệu trực tiếp từ hệ thống ra định dạng Excel hoặc PDF để lưu trữ và báo cáo."
      />

      <section className="panel table-panel">
        <header className="panel-table-header">
          <div>
            <span className="panel-kicker">DANH MỤC XUẤT</span>
            <h2>Chọn dữ liệu cần xuất</h2>
          </div>
          <Table2 />
        </header>

        <div className="report-grid">
          {EXPORT_RESOURCES.map((resource) => (
            <article key={resource.key} className="report-card">
              <div className="report-card-icon">
                <FileSpreadsheet />
              </div>
              <div className="report-card-body">
                <h3>{resource.label}</h3>
                <p>{resource.description}</p>
              </div>
              <div className="report-card-actions">
                <button
                  className="button button--secondary"
                  disabled={busy !== null}
                  onClick={() => handleExport(resource.key, 'xlsx')}
                >
                  {busy === `${resource.key}:xlsx` ? <Loader2 className="spin" /> : <Download />}
                  Excel
                </button>
                <button
                  className="button button--secondary"
                  disabled={busy !== null}
                  onClick={() => handleExport(resource.key, 'pdf')}
                >
                  {busy === `${resource.key}:pdf` ? <Loader2 className="spin" /> : <FileText />}
                  PDF
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
