import { Radius } from "@/types/radius";
import { ProjectExport, ProjectSettings } from "@/types/export";

/**
 * Export project as JSON
 */
export function exportProjectJSON(
  radii: Radius[],
  settings: ProjectSettings
): void {
  const project: ProjectExport = {
    version: "1.0.0",
    createdAt: new Date().toISOString(),
    radii: radii,
    settings: settings,
  };

  const json = JSON.stringify(project, null, 2);
  downloadFile(json, `harmonic-wave-${Date.now()}.json`, "application/json");
}

/**
 * Export signal data as CSV
 */
export function exportSignalCSV(
  signalData: { time: number; y: number }[]
): void {
  if (signalData.length === 0) {
    alert("No signal data to export. Please run the simulation first.");
    return;
  }

  // Create CSV content
  let csv = "time,y\n";
  for (const point of signalData) {
    csv += `${point.time.toFixed(6)},${point.y.toFixed(6)}\n`;
  }

  downloadFile(csv, `signal-data-${Date.now()}.csv`, "text/csv");
}

/**
 * Export canvas as PNG
 */
export function exportCanvasPNG(canvas: HTMLCanvasElement): void {
  canvas.toBlob((blob) => {
    if (!blob) {
      alert("Failed to export canvas");
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `harmonic-wave-${Date.now()}.png`;
    link.click();

    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, "image/png");
}

/**
 * Helper function to download file
 */
function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  // Cleanup
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Import project from JSON
 */
export function importProjectJSON(
  file: File,
  callback: (radii: Radius[], settings: ProjectSettings) => void
): void {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const json = e.target?.result as string;
      const project = JSON.parse(json) as ProjectExport;

      if (!project.radii || !Array.isArray(project.radii)) {
        throw new Error("Invalid project file format");
      }

      callback(project.radii, project.settings || ({} as ProjectSettings));
    } catch (error) {
      alert(`Failed to import project: ${error}`);
    }
  };

  reader.readAsText(file);
}
