// backend/src/controllers/traceability.controller.js
const pool = require("../config/db");
const PDFDocument = require("pdfkit");

// TODO: esto debería venir del token de usuario
const getCurrentUserId = (req) => 1;
const getCurrentCompanyId = (req) => 1;

// ========================================================
// Helpers PDF
// ========================================================
function createPdfResponse(res, filename) {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${filename}.pdf"`
  );
  doc.pipe(res);
  return doc;
}

function renderHeader(doc, { title, companyName, dateLabel, dateValue }) {
  doc.fontSize(16).text(title, { align: "center" });
  doc.moveDown(0.5);

  const yBefore = doc.y;

  doc.fontSize(10).text(`Empresa: ${companyName || "-"}`, {
    align: "left",
  });

  doc.text(`${dateLabel}: ${dateValue || "-"}`, {
    align: "right",
  });

  doc.moveTo(40, yBefore + 18)
    .lineTo(doc.page.width - 40, yBefore + 18)
    .stroke();

  doc.moveDown();
}

function renderTableSection(doc, sectionTitle, rows) {
  doc.moveDown(0.8);
  if (sectionTitle) {
    doc.fontSize(12).text(sectionTitle, { underline: true });
    doc.moveDown(0.3);
  }

  const startX = 40;
  let y = doc.y;
  const labelWidth = 150;
  const valueWidth = doc.page.width - 40 - startX - labelWidth;
  const rowHeight = 18;

  doc.lineWidth(0.5);

  rows.forEach(([label, value]) => {
    const textValue =
      value === null || value === undefined || value === ""
        ? "-"
        : String(value);

    // Celdas
    doc.rect(startX, y, labelWidth, rowHeight).stroke();
    doc.rect(startX + labelWidth, y, valueWidth, rowHeight).stroke();

    // Texto
    doc.fontSize(9);
    doc.text(label, startX + 4, y + 4, {
      width: labelWidth - 8,
      height: rowHeight - 8,
    });
    doc.text(textValue, startX + labelWidth + 4, y + 4, {
      width: valueWidth - 8,
      height: rowHeight - 8,
    });

    y += rowHeight;
  });

  doc.y = y + 10;
}

/**
 * Sección B de firma genérica
 */
function renderSignatureSectionB(doc) {
  doc.moveDown(1);
  doc.fontSize(11).text("B - Observaciones y firma responsable", {
    underline: true,
  });
  doc.moveDown(0.8);

  doc.fontSize(10).text(
    "La información registrada en este formato corresponde a los datos " +
      "reales del lote y del proceso, bajo responsabilidad del productor / tostador.",
    {
      align: "justify",
    }
  );

  doc.moveDown(3);
  const y = doc.y;
  doc.text("______________________________", 40, y);
  doc.text("Firma y sello responsable", 40, y + 12);
}

async function loadBaseLotData(lotId, companyId) {
  const [[company]] = await pool.query(
    "SELECT name FROM companies WHERE id = ? LIMIT 1",
    [companyId]
  );

  const [[lot]] = await pool.query(
    `SELECT l.*, 
            p.name AS provider_name,
            cl.name AS line_name
     FROM lots l
     LEFT JOIN providers p ON p.id = l.provider_id
     LEFT JOIN coffee_lines cl ON cl.id = l.line_id
     WHERE l.id = ? AND l.company_id = ?`,
    [lotId, companyId]
  );

  return { company, lot };
}

// ========================================================
// GUARDAR FORMULARIOS
// ========================================================

// ============ INGRESO MATERIA PRIMA ============
exports.saveIntake = async (req, res) => {
  const lotId = parseInt(req.params.lotId, 10);
  const companyId = getCurrentCompanyId(req);
  const userId = getCurrentUserId(req);

  const {
    destination_id,
    coffee_line_id,
    service_ids,
    humidity_pct,
    package_type,
    package_detail,
    observations,
    caficultor_name,
    farm,
    municipality,
    contact_phone,
    email,
    material_type,
    weight_kg,
  } = req.body;

  try {
    const servicesJson = JSON.stringify(service_ids || []);

    const [rows] = await pool.query(
      "SELECT id FROM lot_intakes WHERE lot_id = ? AND company_id = ? LIMIT 1",
      [lotId, companyId]
    );

    let result;
    if (rows.length > 0) {
      const id = rows[0].id;
      await pool.query(
        `UPDATE lot_intakes
         SET destination_id = ?, line_id = ?, services_json = ?, humidity_pct = ?,
             package_type = ?, package_detail = ?, observations = ?, received_by = ?,
             caficultor_name = ?, farm = ?, municipality = ?, contact_phone = ?,
             email = ?, material_type = ?, weight_kg = ?
         WHERE id = ?`,
        [
          destination_id || null,
          coffee_line_id || null,
          servicesJson,
          humidity_pct || null,
          package_type || null,
          package_detail || null,
          observations || null,
          userId,
          caficultor_name || null,
          farm || null,
          municipality || null,
          contact_phone || null,
          email || null,
          material_type || null,
          weight_kg || null,
          id,
        ]
      );

      const [updated] = await pool.query(
        "SELECT * FROM lot_intakes WHERE id = ?",
        [id]
      );
      result = updated[0];
    } else {
      const [insert] = await pool.query(
        `INSERT INTO lot_intakes
         (company_id, lot_id, destination_id, line_id, services_json, humidity_pct,
          package_type, package_detail, observations, received_by, received_at,
          caficultor_name, farm, municipality, contact_phone, email, material_type, weight_kg)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)`,
        [
          companyId,
          lotId,
          destination_id || null,
          coffee_line_id || null,
          servicesJson,
          humidity_pct || null,
          package_type || null,
          package_detail || null,
          observations || null,
          userId,
          caficultor_name || null,
          farm || null,
          municipality || null,
          contact_phone || null,
          email || null,
          material_type || null,
          weight_kg || null,
        ]
      );

      const [created] = await pool.query(
        "SELECT * FROM lot_intakes WHERE id = ?",
        [insert.insertId]
      );
      result = created[0];
    }

    res.json({ ok: true, data: result });
  } catch (err) {
    console.error("Error saveIntake:", err);
    res.status(500).json({ ok: false, message: "Error guardando ingreso" });
  }
};

// ============ TRILLA ============
exports.saveTrilla = async (req, res) => {
  const lotId = parseInt(req.params.lotId, 10);
  const companyId = getCurrentCompanyId(req);
  const userId = getCurrentUserId(req);
  const {
    input_kg,
    output_kg,
    merma_pct,
    humidity_before,
    humidity_after,
    machine_ok,
    observations,
  } = req.body;

  try {
    const shrinkage_kg =
      input_kg && output_kg ? Number(input_kg) - Number(output_kg) : null;

    const [rows] = await pool.query(
      "SELECT id FROM lot_trillings WHERE lot_id = ? AND company_id = ? LIMIT 1",
      [lotId, companyId]
    );

    let result;
    if (rows.length > 0) {
      const id = rows[0].id;
      await pool.query(
        `UPDATE lot_trillings
         SET input_kg = ?, output_kg = ?, shrinkage_kg = ?, humidity_before = ?,
             humidity_after = ?, machine_ok = ?, observations = ?, performed_by = ?
         WHERE id = ?`,
        [
          input_kg || null,
          output_kg || null,
          shrinkage_kg,
          humidity_before || null,
          humidity_after || null,
          machine_ok ? 1 : 0,
          observations || null,
          userId,
          id,
        ]
      );
      const [updated] = await pool.query(
        "SELECT * FROM lot_trillings WHERE id = ?",
        [id]
      );
      result = updated[0];
    } else {
      const [insert] = await pool.query(
        `INSERT INTO lot_trillings
         (company_id, lot_id, input_kg, output_kg, shrinkage_kg, humidity_before,
          humidity_after, machine_ok, observations, performed_by, performed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          companyId,
          lotId,
          input_kg || null,
          output_kg || null,
          shrinkage_kg,
          humidity_before || null,
          humidity_after || null,
          machine_ok ? 1 : 0,
          observations || null,
          userId,
        ]
      );
      const [created] = await pool.query(
        "SELECT * FROM lot_trillings WHERE id = ?",
        [insert.insertId]
      );
      result = created[0];
    }

    res.json({ ok: true, data: result });
  } catch (err) {
    console.error("Error saveTrilla:", err);
    res.status(500).json({ ok: false, message: "Error guardando trilla" });
  }
};

// ============ TUESTE ============
exports.saveTueste = async (req, res) => {
  const lotId = parseInt(req.params.lotId, 10);
  const companyId = getCurrentCompanyId(req);
  const userId = getCurrentUserId(req);
  const {
    profile_code,
    roast_level,
    batches,
    input_kg,
    output_kg,
    shrinkage_kg,
    humidity_after,
    density,
    observations,
  } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT id FROM lot_roastings WHERE lot_id = ? AND company_id = ? LIMIT 1",
      [lotId, companyId]
    );

    let result;
    if (rows.length > 0) {
      const id = rows[0].id;
      await pool.query(
        `UPDATE lot_roastings
         SET profile_code = ?, roast_level = ?, batches = ?, input_kg = ?,
             output_kg = ?, shrinkage_kg = ?, humidity_after = ?, density = ?,
             observations = ?, performed_by = ?
         WHERE id = ?`,
        [
          profile_code || null,
          roast_level || null,
          batches || null,
          input_kg || null,
          output_kg || null,
          shrinkage_kg || null,
          humidity_after || null,
          density || null,
          observations || null,
          userId,
          id,
        ]
      );
      const [updated] = await pool.query(
        "SELECT * FROM lot_roastings WHERE id = ?",
        [id]
      );
      result = updated[0];
    } else {
      const [insert] = await pool.query(
        `INSERT INTO lot_roastings
         (company_id, lot_id, profile_code, roast_level, batches, input_kg,
          output_kg, shrinkage_kg, humidity_after, density, observations,
          performed_by, performed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          companyId,
          lotId,
          profile_code || null,
          roast_level || null,
          batches || null,
          input_kg || null,
          output_kg || null,
          shrinkage_kg || null,
          humidity_after || null,
          density || null,
          observations || null,
          userId,
        ]
      );
      const [created] = await pool.query(
        "SELECT * FROM lot_roastings WHERE id = ?",
        [insert.insertId]
      );
      result = created[0];
    }

    res.json({ ok: true, data: result });
  } catch (err) {
    console.error("Error saveTueste:", err);
    res.status(500).json({ ok: false, message: "Error guardando tueste" });
  }
};

// ============ CATA ============
exports.saveCata = async (req, res) => {
  const lotId = parseInt(req.params.lotId, 10);
  const companyId = getCurrentCompanyId(req);
  const userId = getCurrentUserId(req);
  const { total_score, decision, notes } = req.body;

  try {
    const isAccepted =
      decision && decision.toLowerCase().includes("libera") ? 1 : 0;

    const [rows] = await pool.query(
      "SELECT id FROM lot_cuppings WHERE lot_id = ? AND company_id = ? LIMIT 1",
      [lotId, companyId]
    );

    let result;
    const attributesJson = JSON.stringify({ decision });

    if (rows.length > 0) {
      const id = rows[0].id;
      await pool.query(
        `UPDATE lot_cuppings
         SET total_score = ?, is_accepted = ?, attributes_json = ?, notes = ?, evaluated_by = ?
         WHERE id = ?`,
        [total_score || null, isAccepted, attributesJson, notes || null, userId, id]
      );
      const [updated] = await pool.query(
        "SELECT * FROM lot_cuppings WHERE id = ?",
        [id]
      );
      result = updated[0];
    } else {
      const [insert] = await pool.query(
        `INSERT INTO lot_cuppings
         (company_id, lot_id, total_score, is_accepted, attributes_json, notes,
          evaluated_by, evaluated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          companyId,
          lotId,
          total_score || null,
          isAccepted,
          attributesJson,
          notes || null,
          userId,
        ]
      );
      const [created] = await pool.query(
        "SELECT * FROM lot_cuppings WHERE id = ?",
        [insert.insertId]
      );
      result = created[0];
    }

    res.json({ ok: true, data: result });
  } catch (err) {
    console.error("Error saveCata:", err);
    res.status(500).json({ ok: false, message: "Error guardando cata" });
  }
};

// ============ EMPAQUE ============
exports.saveEmpaque = async (req, res) => {
  const lotId = parseInt(req.params.lotId, 10);
  const companyId = getCurrentCompanyId(req);
  const userId = getCurrentUserId(req);
  const { total_kg, bags_340, bags_500, bags_1000, observations } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT id FROM lot_packagings WHERE lot_id = ? AND company_id = ? LIMIT 1",
      [lotId, companyId]
    );

    let result;
    const metaJson = JSON.stringify({ bags_340, bags_500, bags_1000 });

    if (rows.length > 0) {
      const id = rows[0].id;
      await pool.query(
        `UPDATE lot_packagings
         SET total_kg = ?, observations = ?, packed_by = ?, package_type = ?, packages_count = ?
         WHERE id = ?`,
        [
          total_kg || null,
          observations ? `${observations}\n${metaJson}` : metaJson,
          userId,
          "bolsas",
          null,
          id,
        ]
      );
      const [updated] = await pool.query(
        "SELECT * FROM lot_packagings WHERE id = ?",
        [id]
      );
      result = updated[0];
    } else {
      const [insert] = await pool.query(
        `INSERT INTO lot_packagings
         (company_id, lot_id, total_kg, observations, packed_by, packed_at, package_type)
         VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
        [companyId, lotId, total_kg || null, observations || metaJson, userId, "bolsas"]
      );
      const [created] = await pool.query(
        "SELECT * FROM lot_packagings WHERE id = ?",
        [insert.insertId]
      );
      result = created[0];
    }

    res.json({ ok: true, data: result });
  } catch (err) {
    console.error("Error saveEmpaque:", err);
    res.status(500).json({ ok: false, message: "Error guardando empaque" });
  }
};

// ============ DESPACHO ============
exports.saveDespacho = async (req, res) => {
  const lotId = parseInt(req.params.lotId, 10);
  const companyId = getCurrentCompanyId(req);
  const userId = getCurrentUserId(req);
  const { client_name, city, document_number, dispatched_kg, observations } =
    req.body;

  try {
    const [rows] = await pool.query(
      "SELECT id FROM lot_dispatches WHERE lot_id = ? AND company_id = ? LIMIT 1",
      [lotId, companyId]
    );

    let result;
    if (rows.length > 0) {
      const id = rows[0].id;
      await pool.query(
        `UPDATE lot_dispatches
         SET client_name = ?, destination_city = ?, document_number = ?, dispatched_kg = ?,
             notes = ?, dispatched_by = ?
         WHERE id = ?`,
        [
          client_name || null,
          city || null,
          document_number || null,
          dispatched_kg || null,
          observations || null,
          userId,
          id,
        ]
      );
      const [updated] = await pool.query(
        "SELECT * FROM lot_dispatches WHERE id = ?",
        [id]
      );
      result = updated[0];
    } else {
      const [insert] = await pool.query(
        `INSERT INTO lot_dispatches
         (company_id, lot_id, client_name, destination_city, document_number,
          dispatched_kg, notes, dispatched_by, dispatched_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          companyId,
          lotId,
          client_name || null,
          city || null,
          document_number || null,
          dispatched_kg || null,
          observations || null,
          userId,
        ]
      );
      const [created] = await pool.query(
        "SELECT * FROM lot_dispatches WHERE id = ?",
        [insert.insertId]
      );
      result = created[0];
    }

    res.json({ ok: true, data: result });
  } catch (err) {
    console.error("Error saveDespacho:", err);
    res
      .status(500)
      .json({ ok: false, message: "Error guardando despacho al cliente" });
  }
};

// ============ INSPECCIÓN ============
exports.saveInspeccion = async (req, res) => {
  const lotId = parseInt(req.params.lotId, 10);
  const companyId = getCurrentCompanyId(req);
  const userId = getCurrentUserId(req);
  const {
    packaging_ok,
    labels_ok,
    moisture_ok,
    foreign_material_ok,
    observations,
  } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT id FROM lot_inspections WHERE lot_id = ? AND company_id = ? LIMIT 1",
      [lotId, companyId]
    );

    const findings = JSON.stringify({
      packaging_ok,
      labels_ok,
      moisture_ok,
      foreign_material_ok,
    });

    let result;
    if (rows.length > 0) {
      const id = rows[0].id;
      await pool.query(
        `UPDATE lot_inspections
         SET result = ?, findings = ?, inspected_by = ?
         WHERE id = ?`,
        [
          "inspeccion",
          observations ? `${observations}\n${findings}` : findings,
          userId,
          id,
        ]
      );
      const [updated] = await pool.query(
        "SELECT * FROM lot_inspections WHERE id = ?",
        [id]
      );
      result = updated[0];
    } else {
      const [insert] = await pool.query(
        `INSERT INTO lot_inspections
         (company_id, lot_id, inspection_type, result, findings, inspected_by, inspected_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          companyId,
          lotId,
          "salida",
          "inspeccion",
          observations ? `${observations}\n${findings}` : findings,
          userId,
        ]
      );
      const [created] = await pool.query(
        "SELECT * FROM lot_inspections WHERE id = ?",
        [insert.insertId]
      );
      result = created[0];
    }

    res.json({ ok: true, data: result });
  } catch (err) {
    console.error("Error saveInspeccion:", err);
    res
      .status(500)
      .json({ ok: false, message: "Error guardando inspección de lote" });
  }
};

// ========================================================
// PDFs ESTRUCTURADOS (A.1, A.2, B)
// ========================================================

// ---------- Ingreso MP ----------
exports.pdfIntake = async (req, res) => {
  const lotId = parseInt(req.params.lotId, 10);
  const companyId = getCurrentCompanyId(req);

  try {
    const { company, lot } = await loadBaseLotData(lotId, companyId);

    const [[intake]] = await pool.query(
      `SELECT li.*, d.name AS destination_name, cl.name AS coffee_line_name
       FROM lot_intakes li
       LEFT JOIN destinations d ON d.id = li.destination_id
       LEFT JOIN coffee_lines cl ON cl.id = li.line_id
       WHERE li.lot_id = ? AND li.company_id = ?
       ORDER BY li.received_at DESC
       LIMIT 1`,
      [lotId, companyId]
    );

    if (!lot || !intake) {
      return res
        .status(404)
        .json({ ok: false, message: "No hay ingreso registrado para ese lote" });
    }

    const fechaRec = intake.received_at
      ? new Date(intake.received_at).toLocaleDateString("es-CO")
      : "-";

    const doc = createPdfResponse(res, `ingreso_lote_${lotId}`);
    renderHeader(doc, {
      title: "FICHA DE INGRESO DE MATERIA PRIMA",
      companyName: company?.name,
      dateLabel: "Fecha de recepción",
      dateValue: fechaRec,
    });

    // A.1 - Datos generales del lote
    renderTableSection(doc, "A.1 - Datos generales del lote", [
      ["Código de lote", lot.code || lot.id],
      ["Nombre / referencia", lot.name || "-"],
      ["Proveedor", lot.provider_name || "-"],
      [
        "Origen",
        `${lot.origin_region || ""} ${lot.origin_place || ""}`.trim(),
      ],
      ["Variedad / proceso", `${lot.variety || ""} / ${lot.process || ""}`],
      ["Línea de café", lot.line_name || "-"],
      ["Kilos ingresados", lot.quantity_kg],
      ["Calidad (puntaje)", lot.quality_score],
    ]);

    // A.2 - Ingreso de materia prima
    let servicesText = "-";
    if (intake.services_json) {
      try {
        const s = JSON.parse(intake.services_json);
        servicesText = Array.isArray(s) ? s.join(", ") : String(s);
      } catch {
        servicesText = "(no se pudo interpretar JSON)";
      }
    }

    renderTableSection(doc, "A.2 - Ingreso de materia prima", [
      ["Destinación", intake.destination_name || "-"],
      ["Línea de café", intake.coffee_line_name || "-"],
      ["Humedad (%)", intake.humidity_pct],
      ["Tipo de empaque", intake.package_type || "-"],
      ["Detalle empaque", intake.package_detail || "-"],
      ["Servicios solicitados", servicesText],
      ["Observaciones", intake.observations || "-"],
    ]);

    // B - Firma responsable
    renderSignatureSectionB(doc);

    doc.end();
  } catch (err) {
    console.error("Error pdfIntake:", err);
    res.status(500).json({ ok: false, message: "Error generando PDF ingreso" });
  }
};

// ---------- Trilla ----------
exports.pdfTrilla = async (req, res) => {
  const lotId = parseInt(req.params.lotId, 10);
  const companyId = getCurrentCompanyId(req);

  try {
    const { company, lot } = await loadBaseLotData(lotId, companyId);

    const [[trilla]] = await pool.query(
      `SELECT * FROM lot_trillings
       WHERE lot_id = ? AND company_id = ?
       ORDER BY performed_at DESC
       LIMIT 1`,
      [lotId, companyId]
    );

    if (!lot || !trilla) {
      return res
        .status(404)
        .json({ ok: false, message: "No hay registro de trilla para ese lote" });
    }

    const fecha = trilla.performed_at
      ? new Date(trilla.performed_at).toLocaleDateString("es-CO")
      : "-";

    const doc = createPdfResponse(res, `trilla_lote_${lotId}`);
    renderHeader(doc, {
      title: "FICHA DE PROCESO DE TRILLA",
      companyName: company?.name,
      dateLabel: "Fecha de trilla",
      dateValue: fecha,
    });

    // A.1 - Datos generales del lote
    renderTableSection(doc, "A.1 - Datos generales del lote", [
      ["Código de lote", lot.code || lot.id],
      ["Nombre / referencia", lot.name || "-"],
      ["Proveedor", lot.provider_name || "-"],
      ["Línea de café", lot.line_name || "-"],
    ]);

    // A.2 - Parámetros de trilla
    renderTableSection(doc, "A.2 - Parámetros de trilla", [
      ["Kilos de entrada", trilla.input_kg],
      ["Kilos de salida", trilla.output_kg],
      ["Merma (kg)", trilla.shrinkage_kg],
      ["Humedad antes (%)", trilla.humidity_before],
      ["Humedad después (%)", trilla.humidity_after],
      ["Máquina OK", trilla.machine_ok ? "Sí" : "No"],
      ["Observaciones", trilla.observations || "-"],
    ]);

    // B - Firma responsable
    renderSignatureSectionB(doc);

    doc.end();
  } catch (err) {
    console.error("Error pdfTrilla:", err);
    res.status(500).json({ ok: false, message: "Error generando PDF trilla" });
  }
};

// ---------- Tueste ----------
exports.pdfTueste = async (req, res) => {
  const lotId = parseInt(req.params.lotId, 10);
  const companyId = getCurrentCompanyId(req);

  try {
    const { company, lot } = await loadBaseLotData(lotId, companyId);

    const [[roast]] = await pool.query(
      `SELECT * FROM lot_roastings
       WHERE lot_id = ? AND company_id = ?
       ORDER BY performed_at DESC
       LIMIT 1`,
      [lotId, companyId]
    );

    if (!lot || !roast) {
      return res
        .status(404)
        .json({ ok: false, message: "No hay registro de tueste para ese lote" });
    }

    const fecha = roast.performed_at
      ? new Date(roast.performed_at).toLocaleDateString("es-CO")
      : "-";

    const doc = createPdfResponse(res, `tueste_lote_${lotId}`);
    renderHeader(doc, {
      title: "FICHA DE PROCESO DE TUESTE",
      companyName: company?.name,
      dateLabel: "Fecha de tueste",
      dateValue: fecha,
    });

    // A.1 - Datos generales del lote
    renderTableSection(doc, "A.1 - Datos generales del lote", [
      ["Código de lote", lot.code || lot.id],
      ["Nombre / referencia", lot.name || "-"],
      ["Proveedor", lot.provider_name || "-"],
      ["Línea de café", lot.line_name || "-"],
    ]);

    // A.2 - Parámetros de tueste
    renderTableSection(doc, "A.2 - Parámetros de tueste", [
      ["Código de perfil", roast.profile_code || "-"],
      ["Nivel de tueste", roast.roast_level || "-"],
      ["Número de baches", roast.batches],
      ["Kilos de entrada", roast.input_kg],
      ["Kilos de salida", roast.output_kg],
      ["Merma (kg)", roast.shrinkage_kg],
      ["Humedad final (%)", roast.humidity_after],
      ["Densidad", roast.density],
      ["Observaciones", roast.observations || "-"],
    ]);

    // B - Firma responsable
    renderSignatureSectionB(doc);

    doc.end();
  } catch (err) {
    console.error("Error pdfTueste:", err);
    res.status(500).json({ ok: false, message: "Error generando PDF tueste" });
  }
};

// ---------- Cata ----------
exports.pdfCata = async (req, res) => {
  const lotId = parseInt(req.params.lotId, 10);
  const companyId = getCurrentCompanyId(req);

  try {
    const { company, lot } = await loadBaseLotData(lotId, companyId);

    const [[cup]] = await pool.query(
      `SELECT * FROM lot_cuppings
       WHERE lot_id = ? AND company_id = ?
       ORDER BY evaluated_at DESC
       LIMIT 1`,
      [lotId, companyId]
    );

    if (!lot || !cup) {
      return res
        .status(404)
        .json({ ok: false, message: "No hay cata registrada para ese lote" });
    }

    const fecha = cup.evaluated_at
      ? new Date(cup.evaluated_at).toLocaleDateString("es-CO")
      : "-";

    let decision = "-";
    if (cup.attributes_json) {
      try {
        const attrs = JSON.parse(cup.attributes_json);
        decision = attrs.decision || "-";
      } catch {
        decision = "-";
      }
    }

    const doc = createPdfResponse(res, `cata_lote_${lotId}`);
    renderHeader(doc, {
      title: "FICHA DE EVALUACIÓN SENSORIAL",
      companyName: company?.name,
      dateLabel: "Fecha de cata",
      dateValue: fecha,
    });

    // A.1 - Datos generales del lote
    renderTableSection(doc, "A.1 - Datos generales del lote", [
      ["Código de lote", lot.code || lot.id],
      ["Nombre / referencia", lot.name || "-"],
      ["Proveedor", lot.provider_name || "-"],
      ["Línea de café", lot.line_name || "-"],
    ]);

    // A.2 - Resultados de cata
    renderTableSection(doc, "A.2 - Resultados de cata", [
      ["Puntaje total", cup.total_score],
      ["Lote aceptado", cup.is_accepted ? "Sí" : "No"],
      ["Decisión", decision],
      ["Notas / observaciones", cup.notes || "-"],
    ]);

    // B - Firma responsable
    renderSignatureSectionB(doc);

    doc.end();
  } catch (err) {
    console.error("Error pdfCata:", err);
    res.status(500).json({ ok: false, message: "Error generando PDF cata" });
  }
};

// ---------- Empaque ----------
exports.pdfEmpaque = async (req, res) => {
  const lotId = parseInt(req.params.lotId, 10);
  const companyId = getCurrentCompanyId(req);

  try {
    const { company, lot } = await loadBaseLotData(lotId, companyId);

    const [[pack]] = await pool.query(
      `SELECT * FROM lot_packagings
       WHERE lot_id = ? AND company_id = ?
       ORDER BY packed_at DESC
       LIMIT 1`,
      [lotId, companyId]
    );

    if (!lot || !pack) {
      return res
        .status(404)
        .json({ ok: false, message: "No hay empaque registrado para ese lote" });
    }

    const fecha = pack.packed_at
      ? new Date(pack.packed_at).toLocaleDateString("es-CO")
      : "-";

    let meta = {};
    if (pack.observations) {
      const lines = pack.observations.split("\n");
      const last = lines[lines.length - 1];
      try {
        meta = JSON.parse(last);
      } catch {
        meta = {};
      }
    }

    const doc = createPdfResponse(res, `empaque_lote_${lotId}`);
    renderHeader(doc, {
      title: "FICHA DE LOTE Y EMPAQUE",
      companyName: company?.name,
      dateLabel: "Fecha de empaque",
      dateValue: fecha,
    });

    // A.1 - Datos del lote
    renderTableSection(doc, "A.1 - Datos del lote", [
      ["Código de lote", lot.code || lot.id],
      ["Nombre / referencia", lot.name || "-"],
      ["Proveedor", lot.provider_name || "-"],
    ]);

    // A.2 - Datos de empaque
    renderTableSection(doc, "A.2 - Datos de empaque", [
      ["Kg totales empacados", pack.total_kg],
      ["Bolsas 340 g", meta.bags_340],
      ["Bolsas 500 g", meta.bags_500],
      ["Bolsas 1 kg", meta.bags_1000],
      ["Tipo de empaque", pack.package_type || "-"],
      ["Observaciones", pack.observations || "-"],
    ]);

    // B - Firma responsable
    renderSignatureSectionB(doc);

    doc.end();
  } catch (err) {
    console.error("Error pdfEmpaque:", err);
    res.status(500).json({ ok: false, message: "Error generando PDF empaque" });
  }
};

// ---------- Despacho ----------
exports.pdfDespacho = async (req, res) => {
  const lotId = parseInt(req.params.lotId, 10);
  const companyId = getCurrentCompanyId(req);

  try {
    const { company, lot } = await loadBaseLotData(lotId, companyId);

    const [[disp]] = await pool.query(
      `SELECT * FROM lot_dispatches
       WHERE lot_id = ? AND company_id = ?
       ORDER BY dispatched_at DESC
       LIMIT 1`,
      [lotId, companyId]
    );

    if (!lot || !disp) {
      return res.status(404).json({
        ok: false,
        message: "No hay despacho registrado para ese lote",
      });
    }

    const fecha = disp.dispatched_at
      ? new Date(disp.dispatched_at).toLocaleDateString("es-CO")
      : "-";

    const doc = createPdfResponse(res, `despacho_lote_${lotId}`);
    renderHeader(doc, {
      title: "FICHA DE DESPACHO AL CLIENTE",
      companyName: company?.name,
      dateLabel: "Fecha de despacho",
      dateValue: fecha,
    });

    // A.1 - Datos del lote
    renderTableSection(doc, "A.1 - Datos del lote", [
      ["Código de lote", lot.code || lot.id],
      ["Nombre / referencia", lot.name || "-"],
      ["Línea de café", lot.line_name || "-"],
    ]);

    // A.2 - Datos de despacho
    renderTableSection(doc, "A.2 - Datos de despacho", [
      ["Cliente", disp.client_name || "-"],
      ["Ciudad destino", disp.destination_city || "-"],
      ["Documento (remisión / factura)", disp.document_number || "-"],
      ["Kilos despachados", disp.dispatched_kg],
      ["Observaciones", disp.notes || "-"],
    ]);

    // B - Firma responsable
    renderSignatureSectionB(doc);

    doc.end();
  } catch (err) {
    console.error("Error pdfDespacho:", err);
    res
      .status(500)
      .json({ ok: false, message: "Error generando PDF despacho" });
  }
};

// ---------- Inspección ----------
exports.pdfInspeccion = async (req, res) => {
  const lotId = parseInt(req.params.lotId, 10);
  const companyId = getCurrentCompanyId(req);

  try {
    const { company, lot } = await loadBaseLotData(lotId, companyId);

    const [[insp]] = await pool.query(
      `SELECT * FROM lot_inspections
       WHERE lot_id = ? AND company_id = ?
       ORDER BY inspected_at DESC
       LIMIT 1`,
      [lotId, companyId]
    );

    if (!lot || !insp) {
      return res.status(404).json({
        ok: false,
        message: "No hay inspección registrada para ese lote",
      });
    }

    const fecha = insp.inspected_at
      ? new Date(insp.inspected_at).toLocaleDateString("es-CO")
      : "-";

    let parsed = {};
    if (insp.findings) {
      const lines = insp.findings.split("\n");
      const last = lines[lines.length - 1];
      try {
        parsed = JSON.parse(last);
      } catch {
        parsed = {};
      }
    }

    const doc = createPdfResponse(res, `inspeccion_lote_${lotId}`);
    renderHeader(doc, {
      title: "FICHA DE INSPECCIÓN Y REGISTRO DE LOTE",
      companyName: company?.name,
      dateLabel: "Fecha de inspección",
      dateValue: fecha,
    });

    // A.1 - Datos del lote
    renderTableSection(doc, "A.1 - Datos del lote", [
      ["Código de lote", lot.code || lot.id],
      ["Nombre / referencia", lot.name || "-"],
      ["Línea de café", lot.line_name || "-"],
    ]);

    // A.2 - Resultados de inspección
    renderTableSection(doc, "A.2 - Resultados de inspección", [
      ["Estado del empaque", parsed.packaging_ok ? "Óptimo" : "No óptimo"],
      ["Etiquetas correctas", parsed.labels_ok ? "Óptimo" : "No óptimo"],
      ["Humedad adecuada", parsed.moisture_ok ? "Óptimo" : "No óptimo"],
      [
        "Sin materiales extraños",
        parsed.foreign_material_ok ? "Óptimo" : "No óptimo",
      ],
      ["Hallazgos / observaciones", insp.findings || "-"],
    ]);

    // B - Firma responsable
    renderSignatureSectionB(doc);

    doc.end();
  } catch (err) {
    console.error("Error pdfInspeccion:", err);
    res
      .status(500)
      .json({ ok: false, message: "Error generando PDF inspección" });
  }
};

// ---------- Ficha completa de trazabilidad ----------
exports.pdfFullTraceability = async (req, res) => {
  const lotId = parseInt(req.params.lotId, 10);
  const companyId = getCurrentCompanyId(req);

  try {
    const { company, lot } = await loadBaseLotData(lotId, companyId);

    if (!lot) {
      return res
        .status(404)
        .json({ ok: false, message: "Lote no encontrado" });
    }

    const [[intake]] = await pool.query(
      `SELECT li.*, d.name AS destination_name, cl.name AS coffee_line_name
       FROM lot_intakes li
       LEFT JOIN destinations d ON d.id = li.destination_id
       LEFT JOIN coffee_lines cl ON cl.id = li.line_id
       WHERE li.lot_id = ? AND li.company_id = ?
       ORDER BY li.received_at DESC
       LIMIT 1`,
      [lotId, companyId]
    );

    const [[trilla]] = await pool.query(
      `SELECT * FROM lot_trillings
       WHERE lot_id = ? AND company_id = ?
       ORDER BY performed_at DESC
       LIMIT 1`,
      [lotId, companyId]
    );

    const [[roast]] = await pool.query(
      `SELECT * FROM lot_roastings
       WHERE lot_id = ? AND company_id = ?
       ORDER BY performed_at DESC
       LIMIT 1`,
      [lotId, companyId]
    );

    const [[cup]] = await pool.query(
      `SELECT * FROM lot_cuppings
       WHERE lot_id = ? AND company_id = ?
       ORDER BY evaluated_at DESC
       LIMIT 1`,
      [lotId, companyId]
    );

    const [[pack]] = await pool.query(
      `SELECT * FROM lot_packagings
       WHERE lot_id = ? AND company_id = ?
       ORDER BY packed_at DESC
       LIMIT 1`,
      [lotId, companyId]
    );

    const [[disp]] = await pool.query(
      `SELECT * FROM lot_dispatches
       WHERE lot_id = ? AND company_id = ?
       ORDER BY dispatched_at DESC
       LIMIT 1`,
      [lotId, companyId]
    );

    const [[insp]] = await pool.query(
      `SELECT * FROM lot_inspections
       WHERE lot_id = ? AND company_id = ?
       ORDER BY inspected_at DESC
       LIMIT 1`,
      [lotId, companyId]
    );

    const doc = createPdfResponse(res, `trazabilidad_lote_${lotId}`);
    renderHeader(doc, {
      title: "FICHA COMPLETA DE TRAZABILIDAD",
      companyName: company?.name,
      dateLabel: "Fecha de generación",
      dateValue: new Date().toLocaleDateString("es-CO"),
    });

    // A.1 - Datos generales del lote
    renderTableSection(doc, "A.1 - Datos generales del lote", [
      ["Código de lote", lot.code || lot.id],
      ["Nombre / referencia", lot.name || "-"],
      ["Proveedor", lot.provider_name || "-"],
      [
        "Origen",
        `${lot.origin_region || ""} ${lot.origin_place || ""}`.trim(),
      ],
      ["Variedad / proceso", `${lot.variety || ""} / ${lot.process || ""}`],
      ["Línea de café", lot.line_name || "-"],
      ["Kilos iniciales", lot.quantity_kg],
      ["Calidad (puntaje)", lot.quality_score],
    ]);

    // A.2 - Procesos por etapa

    if (intake) {
      let servicesText = "-";
      if (intake.services_json) {
        try {
          const s = JSON.parse(intake.services_json);
          servicesText = Array.isArray(s) ? s.join(", ") : String(s);
        } catch {
          servicesText = "(no se pudo interpretar JSON)";
        }
      }

      renderTableSection(doc, "A.2 - Ingreso de materia prima", [
        ["Fecha recepción", intake.received_at],
        ["Destinación", intake.destination_name || "-"],
        ["Línea de café", intake.coffee_line_name || "-"],
        ["Humedad (%)", intake.humidity_pct],
        ["Tipo de empaque", intake.package_type || "-"],
        ["Detalle empaque", intake.package_detail || "-"],
        ["Servicios solicitados", servicesText],
        ["Observaciones", intake.observations || "-"],
      ]);
    }

    if (trilla) {
      renderTableSection(doc, "A.2 - Proceso de trilla", [
        ["Fecha trilla", trilla.performed_at],
        ["Kilos entrada", trilla.input_kg],
        ["Kilos salida", trilla.output_kg],
        ["Merma (kg)", trilla.shrinkage_kg],
        ["Hum. antes (%)", trilla.humidity_before],
        ["Hum. después (%)", trilla.humidity_after],
        ["Máquina OK", trilla.machine_ok ? "Sí" : "No"],
        ["Observaciones", trilla.observations || "-"],
      ]);
    }

    if (roast) {
      renderTableSection(doc, "A.2 - Proceso de tueste", [
        ["Fecha tueste", roast.performed_at],
        ["Código de perfil", roast.profile_code || "-"],
        ["Nivel de tueste", roast.roast_level || "-"],
        ["Baches", roast.batches],
        ["Kilos entrada", roast.input_kg],
        ["Kilos salida", roast.output_kg],
        ["Merma (kg)", roast.shrinkage_kg],
        ["Hum. final (%)", roast.humidity_after],
        ["Densidad", roast.density],
        ["Observaciones", roast.observations || "-"],
      ]);
    }

    if (cup) {
      let decision = "-";
      if (cup.attributes_json) {
        try {
          const attrs = JSON.parse(cup.attributes_json);
          decision = attrs.decision || "-";
        } catch {
          decision = "-";
        }
      }

      renderTableSection(doc, "A.2 - Evaluación en taza", [
        ["Fecha cata", cup.evaluated_at],
        ["Puntaje total", cup.total_score],
        ["Lote aceptado", cup.is_accepted ? "Sí" : "No"],
        ["Decisión", decision],
        ["Notas", cup.notes || "-"],
      ]);
    }

    if (pack) {
      let meta = {};
      if (pack.observations) {
        const lines = pack.observations.split("\n");
        const last = lines[lines.length - 1];
        try {
          meta = JSON.parse(last);
        } catch {
          meta = {};
        }
      }

      renderTableSection(doc, "A.2 - Lote y empaque", [
        ["Fecha empaque", pack.packed_at],
        ["Kg totales empacados", pack.total_kg],
        ["Bolsas 340 g", meta.bags_340],
        ["Bolsas 500 g", meta.bags_500],
        ["Bolsas 1 kg", meta.bags_1000],
        ["Tipo de empaque", pack.package_type || "-"],
        ["Observaciones", pack.observations || "-"],
      ]);
    }

    if (disp) {
      renderTableSection(doc, "A.2 - Despacho al cliente", [
        ["Fecha despacho", disp.dispatched_at],
        ["Cliente", disp.client_name || "-"],
        ["Ciudad destino", disp.destination_city || "-"],
        ["Documento", disp.document_number || "-"],
        ["Kilos despachados", disp.dispatched_kg],
        ["Observaciones", disp.notes || "-"],
      ]);
    }

    if (insp) {
      let parsed = {};
      if (insp.findings) {
        const lines = insp.findings.split("\n");
        const last = lines[lines.length - 1];
        try {
          parsed = JSON.parse(last);
        } catch {
          parsed = {};
        }
      }

      renderTableSection(doc, "A.2 - Inspección final", [
        ["Fecha inspección", insp.inspected_at],
        ["Empaque", parsed.packaging_ok ? "Óptimo" : "No óptimo"],
        ["Etiquetas", parsed.labels_ok ? "Óptimo" : "No óptimo"],
        ["Humedad", parsed.moisture_ok ? "Óptimo" : "No óptimo"],
        [
          "Material extraño",
          parsed.foreign_material_ok ? "Sin hallazgos" : "Con hallazgos",
        ],
        ["Hallazgos / notas", insp.findings || "-"],
      ]);
    }

    // B - Declaración y firma, en página aparte
    doc.addPage();
    doc.fontSize(11).text("B - Declaración y firma responsable", {
      underline: true,
    });
    doc.moveDown(0.8);
    doc.fontSize(10).text(
      "La información aquí consignada refleja los registros reales del proceso " +
        "de trazabilidad del lote, bajo responsabilidad del productor / tostador.",
      {
        align: "justify",
      }
    );

    doc.moveDown(3);
    const y = doc.y;
    doc.text("______________________________", 40, y);
    doc.text("Firma y sello responsable", 40, y + 12);

    doc.end();
  } catch (err) {
    console.error("Error pdfFullTraceability:", err);
    res
      .status(500)
      .json({ ok: false, message: "Error generando PDF trazabilidad completa" });
  }
};
