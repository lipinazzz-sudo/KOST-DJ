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
 */

(function(){

  "use strict";

  const raw =
    sessionStorage.getItem(
      "djTenantSession"
    );

  let session = null;

  if(raw){

    try{

      session =
        JSON.parse(raw);

    }catch(error){

      session = null;

    }

  }

  const valid =
    session &&
    String(
      session.tenantId || ""
    ).trim() &&
    String(
      session.sessionToken || ""
    ).trim();

  if(!valid){

    try{
      sessionStorage.removeItem("djTenantSession");
    }catch(error){}

    /*
     * Bersihkan fallback login tenant agar halaman lama
     * tidak dapat menganggap session lama masih aktif.
     */
    [
      "djTenantAuth",
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

    window.location.replace(
      "login.html?required=1"
    );

    return;

  }

})();
