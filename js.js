
const SUPABASE_URL = "https://pltikqlhcpoykuukmozq.supabase.co";
const SUPABASE_KEY = "sb_publishable_TQXdHVb1nEsRMIySeq5EIA_Yt0yqJ1U";

const locationNotice = document.getElementById("locationNotice");
const locationAccept = document.getElementById("locationAccept");
const locationStatus = document.getElementById("locationStatus");
const locationMap = document.getElementById("locationMap");

// TEMPORIZADORES
function updateCountdowns() {
    const now = new Date();

    document.querySelectorAll("[data-unlock]").forEach(card => {
        const unlockDate = new Date(card.dataset.unlock);
        const countdown = card.querySelector(".countdown");
        const overlay = card.querySelector(".lock-overlay");

        if (!countdown || !overlay) return;

        const difference = unlockDate - now;

        if (difference <= 0) {
            overlay.style.display = "none";
            card.classList.remove("locked");
            card.classList.add("unlocked");
            return;
        }

        const days = Math.floor(difference / 86400000);
        const hours = Math.floor((difference % 86400000) / 3600000);
        const minutes = Math.floor((difference % 3600000) / 60000);
        const seconds = Math.floor((difference % 60000) / 1000);

        countdown.textContent =
            `${days}d ${hours}h ${minutes}m ${seconds}s`;
    });
}

updateCountdowns();
setInterval(updateCountdowns, 1000);

// VERIFICACIÓN VOLUNTARIA DE UBICACIÓN
if (locationAccept && locationNotice && locationStatus) {

    locationAccept.addEventListener("click", () => {

        if (!navigator.geolocation) {
            locationStatus.textContent =
                "Tu navegador no admite la ubicación.";
            return;
        }

        locationAccept.disabled = true;

        locationStatus.textContent =
            "Esperando autorización del navegador...";

        navigator.geolocation.getCurrentPosition(

            async position => {

                const latitud = position.coords.latitude;
                const longitud = position.coords.longitude;
                const precision = position.coords.accuracy;

                locationStatus.textContent =
                    "Guardando tu ubicación...";

                try {

                    const response = await fetch(
                        `${SUPABASE_URL}/rest/v1/ubicaciones`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "apikey": SUPABASE_KEY,
                                "Authorization": `Bearer ${SUPABASE_KEY}`,
                                "Prefer": "return=minimal"
                            },
                            body: JSON.stringify({
                                latitud: latitud,
                                longitud: longitud,
                                precision_metros: precision
                            })
                        }
                    );

                    if (!response.ok) {
                        throw new Error(
                            "Error al guardar: " + response.status
                        );
                    }

                    locationStatus.textContent =
                        "¡Ubicación guardada correctamente!";

                    if (locationMap) {
                        locationMap.href =
                            `https://www.google.com/maps?q=${latitud},${longitud}`;
                        locationMap.hidden = false;
                    }

                    setTimeout(() => {
                        locationNotice.style.display = "none";
                        document.body.classList.remove("location-locked");
                    }, 1500);

                } catch (error) {

                    console.error(error);

                    locationStatus.textContent =
                        "No se pudo guardar tu ubicación. " +
                        "Puedes intentarlo nuevamente.";

                    locationAccept.disabled = false;
                }
            },

            error => {

                if (error.code === 1) {
                    locationStatus.textContent =
                        "No autorizaste compartir tu ubicación.";
                } else if (error.code === 2) {
                    locationStatus.textContent =
                        "No se pudo determinar tu ubicación.";
                } else {
                    locationStatus.textContent =
                        "La solicitud tardó demasiado. Inténtalo nuevamente.";
                }

                locationAccept.disabled = false;
            },

            {
                enableHighAccuracy: false,
                timeout: 15000,
                maximumAge: 0
            }
        );
    });
}
