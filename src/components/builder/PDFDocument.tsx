// This file uses @react-pdf/renderer which is browser-only
// It should only be dynamically imported on the client side

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { TemplateElement } from "./types";

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#111111",
  },
  subheading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333333",
  },
  text: {
    fontSize: 12,
    marginBottom: 6,
    color: "#444444",
    lineHeight: 1.6,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: "#000000",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    marginVertical: 10,
  },
  spacer: {
    height: 16,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
  },
  tableCell: {
    fontSize: 10,
    padding: 5,
    borderWidth: 0.5,
    borderColor: "#cccccc",
    flex: 1,
  },
  tableCellBold: {
    fontSize: 10,
    padding: 5,
    borderWidth: 0.5,
    borderColor: "#cccccc",
    flex: 1,
    fontWeight: "bold",
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    width: 200,
    marginBottom: 4,
    marginTop: 20,
  },
  signatureLabel: {
    fontSize: 10,
    color: "#666666",
  },
  pageNumber: {
    fontSize: 10,
    color: "#999999",
    textAlign: "center",
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
    padding: 8,
    backgroundColor: "#ffffff",
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkboxBox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    color: "#000000",
    fontSize: 10,
    fontWeight: "bold",
  },
  progressBar: {
    height: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
  },
  hyperlink: {
    color: "#2563eb",
    textDecoration: "underline",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#f3f4f6",
  },
});

// Helper function to convert position to absolute positioning
const getElementPosition = (position: { x: number; y: number }, size: { width: number; height: number }) => ({
  position: "absolute" as const,
  left: position.x,
  top: position.y,
  width: size.width,
  height: size.height,
});

// Helper to get text alignment
const getTextAlign = (align?: string): "left" | "center" | "right" | "justify" => {
  if (align === "center") return "center";
  if (align === "right") return "right";
  return "left";
};

// Render individual element based on type
function renderElement(el: TemplateElement, index: number) {
  const { type, properties, style, position, size } = el;
  const opacity = (style.opacity ?? 100) / 100;
  
  // Base container style with absolute positioning
  const containerStyle = {
    ...getElementPosition(position, size),
    opacity,
  };

  switch (type) {
    // Text Elements
    case "label":
      return (
        <View key={el.id || index} style={containerStyle}>
          <Text style={{
            fontSize: properties.fontSize || 14,
            fontWeight: properties.bold ? "bold" : "normal",
            fontStyle: properties.italic ? "italic" : "normal",
            color: properties.color || "#000000",
            textAlign: getTextAlign(properties.textAlign),
            backgroundColor: properties.backgroundColor || "transparent",
          }}>
            {properties.text || "Label"}
          </Text>
        </View>
      );

    case "heading":
      const headingSizes: Record<number, number> = { 1: 32, 2: 26, 3: 22, 4: 18, 5: 16, 6: 14 };
      return (
        <View key={el.id || index} style={containerStyle}>
          <Text style={{
            fontSize: properties.fontSize || headingSizes[properties.headingLevel || 2] || 26,
            fontWeight: properties.bold ? "bold" : "bold",
            fontStyle: properties.italic ? "italic" : "normal",
            color: properties.color || "#000000",
            textAlign: getTextAlign(properties.textAlign),
            backgroundColor: properties.backgroundColor || "transparent",
          }}>
            {properties.text || "Heading"}
          </Text>
        </View>
      );

    case "paragraph":
      return (
        <View key={el.id || index} style={containerStyle}>
          <Text style={{
            fontSize: properties.fontSize || 14,
            fontWeight: properties.bold ? "bold" : "normal",
            fontStyle: properties.italic ? "italic" : "normal",
            color: properties.color || "#000000",
            textAlign: getTextAlign(properties.textAlign),
            lineHeight: properties.lineHeight || 1.5,
            backgroundColor: properties.backgroundColor || "transparent",
          }}>
            {properties.text || "Paragraph text goes here..."}
          </Text>
        </View>
      );

    case "rich-text":
      // Rich text content - strip HTML for PDF
      const strippedText = properties.text?.replace(/<[^>]*>/g, '') || "Rich text content";
      return (
        <View key={el.id || index} style={containerStyle}>
          <Text style={{
            fontSize: properties.fontSize || 14,
            color: properties.color || "#000000",
            backgroundColor: properties.backgroundColor || "transparent",
          }}>
            {strippedText}
          </Text>
        </View>
      );

    // Input Elements
    case "textfield":
    case "email":
    case "phone":
    case "url":
    case "password":
      return (
        <View key={el.id || index} style={containerStyle}>
          <View style={[styles.input, {
            borderColor: properties.borderColor || "#d1d5db",
            borderRadius: properties.borderRadius || 4,
            backgroundColor: properties.backgroundColor || "#ffffff",
          }]}>
            <Text style={{
              fontSize: properties.fontSize || 14,
              color: properties.color || "#000000",
            }}>
              {properties.value || properties.placeholder || ""}
            </Text>
          </View>
        </View>
      );

    case "textarea":
      return (
        <View key={el.id || index} style={containerStyle}>
          <View style={[styles.input, {
            borderColor: properties.borderColor || "#d1d5db",
            borderRadius: properties.borderRadius || 4,
            backgroundColor: properties.backgroundColor || "#ffffff",
            minHeight: size.height - 16,
          }]}>
            <Text style={{
              fontSize: properties.fontSize || 14,
              color: properties.color || "#000000",
            }}>
              {properties.value || properties.placeholder || ""}
            </Text>
          </View>
        </View>
      );

    case "number":
      return (
        <View key={el.id || index} style={containerStyle}>
          <View style={[styles.input, {
            borderColor: properties.borderColor || "#d1d5db",
            borderRadius: properties.borderRadius || 4,
            backgroundColor: properties.backgroundColor || "#ffffff",
          }]}>
            <Text style={{
              fontSize: properties.fontSize || 14,
              color: properties.color || "#000000",
            }}>
              {properties.value || properties.placeholder || "0"}
            </Text>
          </View>
        </View>
      );

    case "currency":
      const currencySymbol = properties.currency === "EUR" ? "€" : properties.currency === "GBP" ? "£" : "$";
      return (
        <View key={el.id || index} style={[containerStyle, { flexDirection: "row" }]}>
          <View style={{
            padding: 8,
            backgroundColor: "#f3f4f6",
            borderWidth: 1,
            borderColor: properties.borderColor || "#d1d5db",
            borderRightWidth: 0,
          }}>
            <Text>{currencySymbol}</Text>
          </View>
          <View style={[styles.input, {
            borderColor: properties.borderColor || "#d1d5db",
            backgroundColor: properties.backgroundColor || "#ffffff",
            flex: 1,
          }]}>
            <Text>{properties.value || properties.placeholder || "0.00"}</Text>
          </View>
        </View>
      );

    case "date":
      return (
        <View key={el.id || index} style={containerStyle}>
          <View style={[styles.input, {
            borderColor: properties.borderColor || "#d1d5db",
            borderRadius: properties.borderRadius || 4,
            backgroundColor: properties.backgroundColor || "#ffffff",
          }]}>
            <Text style={{ fontSize: properties.fontSize || 14 }}>
              {properties.value || properties.placeholder || "Select date"}
            </Text>
          </View>
        </View>
      );

    case "time":
      return (
        <View key={el.id || index} style={containerStyle}>
          <View style={[styles.input, {
            borderColor: properties.borderColor || "#d1d5db",
            borderRadius: properties.borderRadius || 4,
            backgroundColor: properties.backgroundColor || "#ffffff",
          }]}>
            <Text style={{ fontSize: properties.fontSize || 14 }}>
              {properties.value || properties.placeholder || "Select time"}
            </Text>
          </View>
        </View>
      );

    case "datetime":
      return (
        <View key={el.id || index} style={containerStyle}>
          <View style={[styles.input, {
            borderColor: properties.borderColor || "#d1d5db",
            borderRadius: properties.borderRadius || 4,
            backgroundColor: properties.backgroundColor || "#ffffff",
          }]}>
            <Text style={{ fontSize: properties.fontSize || 14 }}>
              {properties.value || properties.placeholder || "Select date & time"}
            </Text>
          </View>
        </View>
      );

    case "checkbox":
      return (
        <View key={el.id || index} style={[containerStyle, styles.checkbox]}>
          <View style={styles.checkboxBox}>
            {properties.checked && <Text style={styles.checkboxChecked}>✓</Text>}
          </View>
          <Text style={{ fontSize: properties.fontSize || 14, color: properties.color || "#000000" }}>
            {properties.label || "Checkbox"}
          </Text>
        </View>
      );

    case "toggle":
      const isOn = properties.checked || false;
      return (
        <View key={el.id || index} style={[containerStyle, { flexDirection: "row", alignItems: "center", gap: 8 }]}>
          <View style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            backgroundColor: isOn ? "#22C55E" : "#d1d5db",
            padding: 2,
          }}>
            <View style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: "white",
              marginLeft: isOn ? 20 : 0,
            }} />
          </View>
          <Text style={{ fontSize: properties.fontSize || 14, color: properties.color || "#000000" }}>
            {isOn ? (properties.onLabel || "On") : (properties.offLabel || "Off")}
          </Text>
        </View>
      );

    case "radio":
      const radioOptions = properties.options || ["Option 1", "Option 2", "Option 3"];
      return (
        <View key={el.id || index} style={[containerStyle, { flexDirection: properties.orientation === "horizontal" ? "row" : "column", gap: 8 }]}>
          {radioOptions.map((opt: string, i: number) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: properties.color || "#374151",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {properties.selectedOption === opt && (
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: properties.color || "#000000" }} />
                )}
              </View>
              <Text style={{ fontSize: properties.fontSize || 14, color: properties.color || "#000000" }}>{opt}</Text>
            </View>
          ))}
        </View>
      );

    case "dropdown":
      return (
        <View key={el.id || index} style={containerStyle}>
          <View style={[styles.input, {
            borderColor: properties.borderColor || "#d1d5db",
            borderRadius: properties.borderRadius || 4,
            backgroundColor: properties.backgroundColor || "#ffffff",
            flexDirection: "row",
            justifyContent: "space-between",
          }]}>
            <Text style={{ fontSize: properties.fontSize || 14 }}>
              {properties.selectedOption || properties.placeholder || "Select..."}
            </Text>
            <Text>▼</Text>
          </View>
        </View>
      );

    case "rating":
      const ratingValue = properties.value || 0;
      const maxRating = properties.maxRating || 5;
      return (
        <View key={el.id || index} style={[containerStyle, { flexDirection: "row", gap: 2 }]}>
          {Array.from({ length: maxRating }).map((_, i) => (
            <Text key={i} style={{
              fontSize: 16,
              color: i < ratingValue ? "#FFD700" : "#d1d5db",
            }}>
              ★
            </Text>
          ))}
        </View>
      );

    case "slider":
      const sliderValue = properties.value || 50;
      const minVal = properties.minValue || 0;
      const maxVal = properties.maxValue || 100;
      const percentage = ((sliderValue - minVal) / (maxVal - minVal)) * 100;
      return (
        <View key={el.id || index} style={[containerStyle, { justifyContent: "center" }]}>
          <View style={styles.progressBar}>
            <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
          </View>
          {properties.showLabels && (
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
              <Text style={{ fontSize: 10, color: properties.color || "#6B7280" }}>{minVal}</Text>
              <Text style={{ fontSize: 10, color: properties.color || "#6B7280" }}>{sliderValue}</Text>
              <Text style={{ fontSize: 10, color: properties.color || "#6B7280" }}>{maxVal}</Text>
            </View>
          )}
        </View>
      );

    case "progress-bar":
      const progressVal = properties.progressValue || 0;
      return (
        <View key={el.id || index} style={[containerStyle, { justifyContent: "center" }]}>
          <View style={styles.progressBar}>
            <View style={[styles.progressBarFill, { 
              width: `${progressVal}%`,
              backgroundColor: properties.progressColor || "#3b82f6",
            }]} />
          </View>
          {properties.showPercentage && (
            <Text style={{ fontSize: 10, color: properties.color || "#6B7280", marginTop: 4, textAlign: "center" }}>
              {progressVal}%
            </Text>
          )}
        </View>
      );

    case "signature":
      return (
        <View key={el.id || index} style={containerStyle}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>
            {properties.placeholder || "Sign here"}
          </Text>
        </View>
      );

    // Media Elements
    case "image":
    case "logo":
      return properties.src ? (
        <View key={el.id || index} style={containerStyle}>
          <Image
            src={properties.src}
            style={{
              width: size.width,
              height: size.height,
              objectFit: properties.fit || "contain",
            }}
          />
        </View>
      ) : (
        <View key={el.id || index} style={[containerStyle, {
          borderWidth: 1,
          borderColor: properties.borderColor || "#e5e7eb",
          borderRadius: properties.borderRadius || 4,
          backgroundColor: properties.backgroundColor || "#f9fafb",
          alignItems: "center",
          justifyContent: "center",
        }]}>
          <Text style={{ fontSize: 12, color: "#9ca3af" }}>
            {type === "logo" ? "Logo" : "Image"}
          </Text>
        </View>
      );

    // Shape Elements
    case "divider":
      return (
        <View key={el.id || index} style={[containerStyle, { justifyContent: "center" }]}>
          <View style={{
            borderBottomWidth: properties.borderWidth || 1,
            borderBottomColor: properties.color || "#d1d5db",
            borderStyle: properties.lineStyle === "dashed" ? "dashed" : properties.lineStyle === "dotted" ? "dotted" : "solid",
          }} />
        </View>
      );

    case "line":
      return (
        <View key={el.id || index} style={[containerStyle, {
          backgroundColor: properties.color || "#000000",
        }]} />
      );

    case "rectangle":
    case "rounded-box":
      return (
        <View key={el.id || index} style={[containerStyle, {
          borderWidth: properties.borderWidth || 1,
          borderColor: properties.strokeColor || "#000000",
          borderRadius: type === "rounded-box" ? (properties.borderRadius || 8) : 0,
          backgroundColor: properties.fillColor || "transparent",
        }]} />
      );

    case "circle":
    case "ellipse":
      const isCircle = type === "circle";
      return (
        <View key={el.id || index} style={[containerStyle, {
          borderWidth: properties.borderWidth || 1,
          borderColor: properties.strokeColor || "#000000",
          borderRadius: isCircle ? size.width / 2 : size.width / 2,
          backgroundColor: properties.fillColor || "transparent",
        }]} />
      );

    // Data Elements
    case "table":
      const tableData = properties.tableData || [
        ["Header 1", "Header 2", "Header 3"],
        ["Row 1 Col 1", "Row 1 Col 2", "Row 1 Col 3"],
        ["Row 2 Col 1", "Row 2 Col 2", "Row 2 Col 3"],
      ];
      const headers = tableData[0] || [];
      const rows = tableData.slice(1);
      
      return (
        <View key={el.id || index} style={containerStyle}>
          {/* Header Row */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            {headers.map((header: string, i: number) => (
              <Text key={i} style={styles.tableCellBold}>{header}</Text>
            ))}
          </View>
          {/* Data Rows */}
          {rows.map((row: string[], i: number) => (
            <View key={i} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? "#fff" : "#f9f9f9" }]}>
              {row.map((cell: string, j: number) => (
                <Text key={j} style={styles.tableCell}>{cell}</Text>
              ))}
            </View>
          ))}
        </View>
      );

    case "list":
      const listItems = properties.listItems || ["Item 1", "Item 2", "Item 3"];
      return (
        <View key={el.id || index} style={[containerStyle, { gap: 4 }]}>
          {listItems.map((item: string, i: number) => (
            <Text key={i} style={{ fontSize: properties.fontSize || 12, color: properties.color || "#000000" }}>
              • {item}
            </Text>
          ))}
        </View>
      );

    // Navigation Elements
    case "hyperlink":
      return (
        <View key={el.id || index} style={containerStyle}>
          <Text style={[styles.hyperlink, { fontSize: properties.fontSize || 14 }]}>
            {properties.text || properties.linkUrl || "Link"}
          </Text>
        </View>
      );

    case "button":
      const buttonColors: Record<string, string> = {
        primary: "#3b82f6",
        secondary: "#6b7280",
        destructive: "#ef4444",
        outline: "transparent",
        ghost: "transparent",
      };
      const bgColor = buttonColors[properties.buttonStyle || "primary"] || "#3b82f6";
      const textColor = properties.buttonStyle === "outline" || properties.buttonStyle === "ghost" ? "#3b82f6" : "#ffffff";
      
      return (
        <View key={el.id || index} style={[containerStyle, {
          backgroundColor: bgColor,
          borderWidth: properties.buttonStyle === "outline" ? 1 : 0,
          borderColor: "#3b82f6",
          borderRadius: properties.borderRadius || 6,
          alignItems: "center",
          justifyContent: "center",
        }]}>
          <Text style={{ color: textColor, fontSize: properties.fontSize || 14, fontWeight: "bold" }}>
            {properties.text || "Button"}
          </Text>
        </View>
      );

    // Decorative Elements
    case "badge":
      const badgeColors: Record<string, string> = {
        default: "#f3f4f6",
        secondary: "#e5e7eb",
        destructive: "#fef2f2",
        outline: "transparent",
      };
      return (
        <View key={el.id || index} style={[containerStyle, styles.badge, {
          backgroundColor: badgeColors[properties.badgeVariant || "default"],
          borderWidth: properties.badgeVariant === "outline" ? 1 : 0,
          borderColor: "#d1d5db",
        }]}>
          <Text style={{ fontSize: properties.fontSize || 12, color: properties.color || "#000000" }}>
            {properties.text || "Badge"}
          </Text>
        </View>
      );

    case "page-number":
      return (
        <Text
          key={el.id || index}
          style={[styles.pageNumber, {
            fontSize: properties.fontSize || 10,
            color: properties.color || "#999999",
          }]}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      );

    // Default fallback
    default:
      return null;
  }
}

interface PDFDocumentProps {
  title: string;
  elements: TemplateElement[];
  pageSize?: "A4" | "Letter" | "Legal";
  orientation?: "portrait" | "landscape";
}

export function PDFDocument({ title, elements, pageSize = "A4", orientation = "portrait" }: PDFDocumentProps) {
  return (
    <Document title={title}>
      <Page size={pageSize} orientation={orientation} style={styles.page}>
        <View>
          {elements.map((el, i) => renderElement(el, i))}
        </View>
      </Page>
    </Document>
  );
}
