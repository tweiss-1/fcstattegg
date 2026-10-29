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

    $ Vereins-E-Mail-Adresse
    $recipient = "thomas.weiss@fcstattegg.at";

    // --- A) E-MAIL AN DEN VEREIN ---
    $subject_club = "Neue Fanartikel-Bestellung von " . $vorname . " " . $nachname;
    $content_club = "Es ist eine neue Fanartikel-Bestellung eingegangen:\n\n";
    $content_club .= "--- KUNDENDATEN ---\n";
    $content_club .= "Name: $vorname $nachname\n";
    $content_club .= "Anschrift: $anschrift, $plz $ort\n";
    $content_club .= "E-Mail: $email\n";
    $content_club .= "Telefon: $telefon\n\n";
    $content_club .= "--- BESTELLUNG ---\n";
    $content_club .= "$bestellung\n\n";
    $content_club .= "Gesamtsumme: $gesamtsumme\n";

    $headers_club = "From: webshop@fc-stattegg.at\r\n";
    $headers_club .= "Reply-To: $email\r\n";
    $headers_club .= "Content-Type: text/plain; charset=UTF-8\r\n";


    // --- B) E-MAIL AN DEN KUNDEN (BESTÄTIGUNG + ZAHLUNGSDETAILS) ---
    $subject_customer = "Deine Fanartikel-Bestellung beim FC Stattegg";
    $content_customer = "Hallo $vorname $nachname,\n\n";
    $content_customer .= "vielen Dank für deine Bestellung beim FC Stattegg! Wir haben folgende Artikel erhalten:\n\n";
    $content_customer .= "$bestellung\n\n";
    $content_customer .= "Gesamtsumme: $gesamtsumme\n\n";
    $content_customer .= "--- ZAHLUNGSINFORMATIONEN ---\n";
    $content_customer .= "Bitte überweise den Gesamtbetrag auf folgendes Konto:\n";
    $content_customer .= "Bank: Deine Bank / Raiffeisenbank\n";
    $content_customer .= "IBAN: AT00 0000 0000 0000 0000\n";
    $content_customer .= "BIC: XXXXXXXXXXX\n";
    $content_customer .= "Verwendungszweck: Bestellung Fanartikel $achname $vorname\n\n";
    $content_customer .= "Nach Eingang der Zahlung wird deine Bestellung für dich vorbereitet.\n\n";
    $content_customer .= "Sportliche Grüße\nFC Stattegg";

    $headers_customer = "From: thomas.weiss@fcstattegg.at\r\n";
    $headers_customer .= "Reply-To: thomas.weiss@fcstattegg.at\r\n";
    $headers_customer .= "Content-Type: text/plain; charset=UTF-8\r\n";


    // 3. Beide E-Mails absenden
    $mail_club = mail($recipient, $subject_club, $content_club, $headers_club);
    $mail_customer = mail($email, $subject_customer, $content_customer, $headers_customer);

    if ($mail_club && $mail_customer) {
        http_response_code(200);
        echo "Vielen Dank für deine Bestellung! Eine Bestätigung mit den Zahlungsdetails wurde an deine E-Mail-Adresse gesendet.";
    } else {
        http_response_code(500);
        echo "Oops! Beim Senden der E-Mails ist ein Fehler aufgetreten.";
    }

} else {
    http_response_code(403);
    echo "Ungültiger Zugriff.";
}
?>