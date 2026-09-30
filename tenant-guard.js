/*
 * ============================================================
 * DJ FAMILY KOST — TENANT PAGE ACCESS GUARD
 * ============================================================
 *
 * Hanya halaman yang memang ditujukan untuk tenant yang
 * memuat file ini.
 *
 * Syarat minimum:
 *   - djTenantSession tersedia
 *   - tenantId tersedia
 *   - sessionToken tersedia
 *
 * Tidak menyentuh session Master.
 *
 * Catatan:
 *   Guard ini hanya memeriksa session tenant di browser.
 *   Validasi autentikasi/otorisasi sebenarnya tetap dilakukan
 *   oleh API pada setiap request yang membutuhkan sessionToken.
 */

(function(){

  "use strict";

  function clearInvalidTenantSession(){

    [
      "djTenantSession",
      "djTenantAuth",
      "djTenantData",
      "djTenantId",
      "djTenantName",
      "djTenantRoom",
      "djTenantSessionToken",
      "djTenantToken",
      "djSessionToken"
    ].forEach(function(key){

      try{

        sessionStorage.removeItem(key);

      }catch(error){}

    });

  }


  function readTenantSession(){

    let raw = "";

    try{

      raw =
        sessionStorage.getItem(
          "djTenantSession"
        ) || "";

    }catch(error){

      raw = "";

    }


    if(!raw){

      return null;

    }


    let session = null;

    try{

      session =
        JSON.parse(
          raw
        );

    }catch(error){

      return null;

    }


    if(
      !session ||
      typeof session !== "object"
    ){

      return null;

    }


    const tenantId =
      String(
        session.tenantId || ""
      ).trim();


    const sessionToken =
      String(
        session.sessionToken || ""
      ).trim();


    /*
     * Jangan menerima object session yang hanya memiliki
     * salah satu nilai. Kedua nilai harus berasal dari
     * session tenant yang sama.
     */
    if(
      !tenantId ||
      !sessionToken
    ){

      return null;

    }


    return session;

  }


  const session =
    readTenantSession();


  if(!session){

    clearInvalidTenantSession();

    window.location.replace(
      "login.html?required=1"
    );

    return;

  }

})();
