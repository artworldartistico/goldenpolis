/**
 * GOOGLE APPS SCRIPT - SUBIDA DE COMPROBANTES A GOOGLE DRIVE
 * 
 * INSTRUCCIONES DE IMPLEMENTACIÓN:
 * 
 * 1. Ve a https://script.google.com
 * 2. Crea un "Nuevo proyecto"
 * 3. Pega este código completo
 * 4. Reemplaza 'TU_FOLDER_ID' con el ID de tu carpeta de Drive (opcional)
 * 5. Click en "Implementar" → "Nueva implementación"
 * 6. Tipo: "Aplicación web"
 * 7. Descripción: "API de subida de comprobantes"
 * 8. Ejecutar como: "Yo"
 * 9. Quién tiene acceso: "Cualquier persona"
 * 10. Click en "Implementar"
 * 11. Copia la URL web y pégala en checkout.js línea 34
 * 
 * NOTA: Si no especificas TU_FOLDER_ID, se creará una carpeta llamada "Comprobantes"
 */

 function doPost(e) {
    try {
      // Obtener datos del POST
      const params = e.parameter;
      const file = params.file;
      const filename = params.filename || 'comprobante_' + new Date().getTime();
      const mimeType = params.mimeType || 'image/jpeg';
      
      // Validar que se recibió el archivo
      if (!file) {
        return createResponse(false, "No se recibió ningún archivo");
      }
      
      // Decodificar base64 a blob
      let blob;
      try {
        const decodedFile = Utilities.base64Decode(file);
        blob = Utilities.newBlob(decodedFile, mimeType, filename);
      } catch (error) {
        return createResponse(false, "Error al decodificar el archivo: " + error.toString());
      }
      
      // Obtener o crear carpeta de destino
      let folder;
      try {
        // OPCIÓN 1: Usar una carpeta específica (reemplaza 'TU_FOLDER_ID' con el ID real)
        // Para obtener el ID: abre la carpeta en Drive, copia el ID de la URL
        // folder = DriveApp.getFolderById('TU_FOLDER_ID');
        
        // OPCIÓN 2: Crear/usar carpeta "Comprobantes" en el root
        const folderName = "Comprobantes";
        const folders = DriveApp.getFoldersByName(folderName);
        
        if (folders.hasNext()) {
          folder = folders.next();
        } else {
          folder = DriveApp.createFolder(folderName);
        }
      } catch (error) {
        return createResponse(false, "Error al acceder a la carpeta: " + error.toString());
      }
      
      // Subir archivo a Drive
      let uploadedFile;
      try {
        uploadedFile = folder.createFile(blob);
        
        // Hacer el archivo público para que se pueda ver con el link
        uploadedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
      } catch (error) {
        return createResponse(false, "Error al subir el archivo: " + error.toString());
      }
      
      // Retornar respuesta exitosa
      return createResponse(true, "Archivo subido correctamente", {
        url: uploadedFile.getUrl(),
        id: uploadedFile.getId(),
        name: uploadedFile.getName(),
        size: uploadedFile.getSize(),
        mimeType: uploadedFile.getMimeType(),
        dateCreated: uploadedFile.getDateCreated().toISOString()
      });
      
    } catch (error) {
      // Capturar cualquier error no manejado
      return createResponse(false, "Error general: " + error.toString());
    }
  }
  
  /**
   * Función auxiliar para crear respuestas JSON
   */
  function createResponse(success, message, data = {}) {
    const response = {
      success: success,
      message: message,
      timestamp: new Date().toISOString()
    };
    
    if (success) {
      response.data = data;
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  /**
   * Función de prueba para GET (opcional)
   * Útil para verificar que el script está funcionando
   */
  function doGet(e) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "active",
        message: "API de subida de comprobantes funcionando correctamente",
        timestamp: new Date().toISOString(),
        version: "1.0"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  /**
   * FUNCIÓN DE PRUEBA MANUAL
   * Puedes ejecutar esta función desde el editor para probar
   */
  function testUpload() {
    // Crear un archivo de prueba
    const testBlob = Utilities.newBlob("Archivo de prueba", "text/plain", "prueba.txt");
    const folder = DriveApp.getFoldersByName("Comprobantes").next();
    const file = folder.createFile(testBlob);
    
    Logger.log("Archivo de prueba creado:");
    Logger.log("URL: " + file.getUrl());
    Logger.log("ID: " + file.getId());
  }
  
  /**
   * NOTAS ADICIONALES:
   * 
   * - Los archivos se suben con permisos "Cualquier persona con el enlace puede ver"
   * - Se guarda metadata del archivo (URL, ID, nombre, tamaño, tipo, fecha)
   * - El timestamp está en formato ISO para facilitar el registro
   * - Si hay error, se retorna un mensaje descriptivo
   * 
   * SEGURIDAD:
   * - Este script NO valida el tamaño del archivo (se hace en el frontend)
   * - Este script NO valida el tipo de archivo (se hace en el frontend)
   * - Solo personas con el link pueden ver los archivos
   * - El script se ejecuta bajo TU cuenta de Google
   * 
   * LÍMITES DE GOOGLE:
   * - Máximo 20MB por archivo
   * - Máximo 15GB de almacenamiento total en Drive (cuenta gratuita)
   * - Sin límite de requests por día (en la práctica)
   */



   function doPost(e) {
    try {
      const data = JSON.parse(e.postData.contents);
      const file = data.file;
      const filename = data.filename || 'comprobante_' + new Date().getTime();
      const mimeType = data.mimeType || 'image/jpeg';
      
      // Decodificar base64
      const blob = Utilities.newBlob(
        Utilities.base64Decode(file), 
        mimeType, 
        filename
      );
      
      // Crear o obtener carpeta
      const folder = DriveApp.getFolderById('TU_FOLDER_ID') || DriveApp.createFolder('Comprobantes');
      
      // Subir archivo
      const uploadedFile = folder.createFile(blob);
      uploadedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        url: uploadedFile.getUrl(),
        id: uploadedFile.getId()
      })).setMimeType(ContentService.MimeType.JSON);
      
    } catch (error) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: error.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }


  //En modo FormData en caso de que CORS de JSOn sea muy complicado para el App Script
  function doPost(e) {
    try {
      const file = e.parameter.file;
      const filename = e.parameter.filename || 'comprobante_' + new Date().getTime();
      const mimeType = e.parameter.mimeType || 'image/jpeg';
  
      const blob = Utilities.newBlob(
        Utilities.base64Decode(file),
        mimeType,
        filename
      );
  
      const folder = DriveApp.getFolderById('TU_FOLDER_ID');
  
      const uploadedFile = folder.createFile(blob);
      uploadedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          url: uploadedFile.getUrl(),
          id: uploadedFile.getId()
        }))
        .setMimeType(ContentService.MimeType.JSON);
  
    } catch (error) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          message: error.toString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }