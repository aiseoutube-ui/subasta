
/**
 * BACKEND SUBASTA PRO V8 - EL MARTILLO MANUAL
 */

function getSs() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Función que ejecuta el cambio físico al siguiente producto del catálogo
 */
function ejecutarSaltoSiguiente() {
  const ss = getSs();
  const subastaSheet = ss.getSheetByName('subasta');
  const productosSheet = ss.getSheetByName('productos');
  const historialSheet = ss.getSheetByName('historial');
  const usuariosSheet = ss.getSheetByName('usuarios');

  const subastaData = subastaSheet.getRange(2, 1, 1, 6).getValues()[0];
  const currentId = String(subastaData[0]).trim();
  const productos = productosSheet.getDataRange().getValues();
  
  let nextIndex = -1;
  for (let i = 1; i < productos.length; i++) {
    if (String(productos[i][0]).trim() === currentId) {
      nextIndex = i + 1;
      break;
    }
  }

  // Si no hay ID actual (hoja vacía), empezamos con el primero
  if (currentId === "" || currentId === "undefined") nextIndex = 1;

  if (nextIndex > 0 && nextIndex < productos.length) {
    const nextProd = productos[nextIndex];
    // Seteamos: [ID, Precio, Ganador, Fin, Activo, Pausado]
    // Importante: Empezamos en PAUSADO y ACTIVO=FALSE hasta que el admin inicie
    subastaSheet.getRange(2, 1, 1, 6).setValues([
      [nextProd[0], nextProd[2], "Nadie", 0, false, true]
    ]);
    
    // Limpiar historial
    if (historialSheet.getLastRow() > 1) {
      historialSheet.getRange(2, 1, historialSheet.getLastRow(), 3).clearContent();
    }
    
    SpreadsheetApp.flush();
    return { success: true, nextId: nextProd[0] };
  }
  return { success: false, message: "Fin del catálogo" };
}

function doGet(e) {
  try {
    const ss = getSs();
    const subastaSheet = ss.getSheetByName('subasta');
    const productosSheet = ss.getSheetByName('productos');
    const historialSheet = ss.getSheetByName('historial');
    
    const subastaData = subastaSheet.getRange(2, 1, 1, 6).getValues()[0];
    const now = Date.now();
    
    const status = {
      productId: String(subastaData[0]),
      currentPrice: Number(subastaData[1]) || 0,
      lastBidder: subastaData[2] || "Nadie",
      endTime: Number(subastaData[3]) || 0,
      isActive: String(subastaData[4]).toUpperCase() === "TRUE",
      isPaused: String(subastaData[5]).toUpperCase() === "TRUE"
    };

    // Auto-cierre de tiempo (Solo pone isActive en FALSE, no salta de producto)
    if (status.isActive && status.endTime > 0 && now > status.endTime) {
      subastaSheet.getRange(2, 5).setValue(false);
      status.isActive = false;
    }

    // Obtener detalles del producto actual
    const productos = productosSheet.getDataRange().getValues();
    let details = { name: "Sin Producto", img: "" };
    for (let i = 1; i < productos.length; i++) {
      if (String(productos[i][0]).trim() === status.productId.trim()) {
        details = { name: productos[i][1], img: productos[i][3] || "" };
        break;
      }
    }

    const history = historialSheet.getRange(2, 1, 10, 3).getValues()
      .filter(row => row[2])
      .map(row => ({ time: String(row[0]), amount: row[1], bidder: row[2] }));

    return createJsonResponse({ 
      success: true, 
      serverTime: now, 
      data: { status: { ...status, productName: details.name, productImg: details.img }, history } 
    });
  } catch (err) {
    return createJsonResponse({ success: false, message: err.toString() });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const params = JSON.parse(e.postData.contents);
    const ss = getSs();
    const subastaSheet = ss.getSheetByName('subasta');
    const historialSheet = ss.getSheetByName('historial');

    if (params.action === 'bid') {
      const data = subastaSheet.getRange(2, 1, 1, 6).getValues()[0];
      if (String(data[4]).toUpperCase() === "FALSE" || String(data[5]).toUpperCase() === "TRUE") 
        throw new Error("SUBASTA_CERRADA");
      
      const currentPrice = Number(data[1]);
      const newBid = Number(params.amount);
      
      if (newBid > currentPrice) {
        const now = Date.now();
        let newEndTime = Number(data[3]);
        if (newEndTime === 0) newEndTime = now + 40000; // 40 seg iniciales
        else if (newEndTime - now < 10000) newEndTime = now + 10000; // Extensión de 10 seg

        subastaSheet.getRange(2, 2, 1, 3).setValues([[newBid, params.name, newEndTime]]);
        historialSheet.insertRowBefore(2);
        historialSheet.getRange(2, 1, 1, 3).setValues([[new Date().toLocaleTimeString(), newBid, params.name]]);
        return createJsonResponse({ success: true });
      }
      throw new Error("PUJA_BAJA");
    }

    if (params.action === 'admin_start') {
      // Inicia el reloj por primera vez
      const now = Date.now();
      subastaSheet.getRange(2, 4, 1, 3).setValues([[now + 45000, true, false]]);
      return createJsonResponse({ success: true });
    }

    if (params.action === 'admin_close') {
      // Martillazo final
      subastaSheet.getRange(2, 5).setValue(false);
      return createJsonResponse({ success: true });
    }

    if (params.action === 'admin_next') {
      // SALTO MANUAL AL SIGUIENTE
      const res = ejecutarSaltoSiguiente();
      return createJsonResponse(res);
    }

    if (params.action === 'register') {
      ss.getSheetByName('usuarios').appendRow([new Date(), params.name, params.phone, 'REG']);
      return createJsonResponse({ success: true });
    }

    return createJsonResponse({ success: false, message: "Acción inválida" });
  } catch (error) {
    return createJsonResponse({ success: false, message: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
