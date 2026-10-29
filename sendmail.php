<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // 1. Formulardaten abfangen und bereinigen
    $vorname     = strip_tags(trim($_POST["vorname"] ?? ''));
    $nachname    = strip_tags(trim($_POST["nachname"] ?? ''));
    $anschrift   = strip_tags(trim($_POST["anschrift"] ?? ''));
    $plz         = strip_tags(trim($_POST["plz"] ?? ''));
    $ort         = strip_tags(trim($_POST["ort"] ?? ''));
    $email       = filter_var(trim($_POST["email"] ?? ''), FILTER_SANITIZE_EMAIL);
    $telefon     = strip_tags(trim($_POST["telefon"] ?? 'Nicht angegeben'));
    $bestellung  = trim($_POST["Bestellung"] ?? '');
    $gesamtsumme = trim($_POST["Gesamtsumme"] ?? '€ 0,00');

    // 2. Pflichtfelder überprüfen
    if (empty($vorname) || empty($nachname) || empty($anschrift) || empty($plz) || empty($ort) || empty($email) || empty($bestellung)) {
        http_response_code(400);
        echo "Bitte fülle alle Pflichtfelder aus und wähle mindestens einen Artikel.";
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo "Die angegebene E-Mail-Adresse ist ungültig.";
        exit;
    }

    // --- HIER DEINE VEREINS-E-MAIL-ADRESSE EINTRAGEN ---
    $recipient = "thomas.weiss@fcstattegg.at";

    // 3. E-Mail-Betreff und Inhalt zusammenbauen
    $subject = "Neue Fanartikel-Bestellung von " . $vorname . " " . $nachname;

    $email_content = "Es ist eine neue Fanartikel-Bestellung eingegangen:\n\n";
    $email_content .= "--- KUNDENDATEN ---\n";
    $email_content .= "Name: $vorname $nachname\n";
    $email_content .= "Anschrift: $anschrift, $plz $ort\n";
    $email_content .= "E-Mail: $email\n";
    $email_content .= "Telefon: $telefon\n\n";
    $email_content .= "--- BESTELLUNG ---\n";
    $email_content .= "$bestellung\n\n";
    $email_content .= "Gesamtsumme: $gesamtsumme\n";

    // 4. E-Mail-Header (Absender & Antwort-Adresse auf den Kunden setzen)
    $email_headers = "From: thomas.weiss@fcstattegg.at\r\n"; // Wichtig: Muss oft eine Domain-eigene Adresse sein
    $email_headers .= "Reply-To: $email\r\n";
    $email_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // 5. E-Mail senden
    if (mail($recipient, $subject, $email_content, $email_headers)) {
        // Optional: Hier könntest du den Nutzer auf eine Danke-Seite weiterleiten
        // header("Location: danke.html");
        // exit;
        
        http_response_code(200);
        echo "Vielen Dank für deine Bestellung! Die E-Mail wurde erfolgreich versendet.";
    } else {
        http_response_code(500);
        echo "Oops! Beim Senden der Bestellung ist ein Fehler aufgetreten.";
    }

} else {
    http_response_code(403);
    echo "Ungültiger Zugriff.";
}
?>