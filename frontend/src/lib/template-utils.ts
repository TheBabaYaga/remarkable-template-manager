import { main } from "wailsjs/go/models";
import { Template } from "@/components/TemplateList";

/**
 * Maps DeviceTemplate from Go backend to frontend Template format
 */
export function mapDeviceTemplatesToTemplates(deviceTemplates: main.DeviceTemplate[]): Template[] {
  return deviceTemplates.map(t => ({
    name: t.name,
    filename: t.filename,
    iconCode: t.iconCode,
    landscape: t.landscape,
    categories: t.categories,
  }));
}

/**
 * Removes file extension from a filename
 * @param filename - The filename with extension (e.g., "template.svg")
 * @returns The filename without extension (e.g., "template")
 */
export function removeFileExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}
