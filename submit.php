<?php
header("Content-Type: application/json");


if (!isset($_POST["name"], $_POST["email"], $_POST["message"], $_POST["phone"], $_POST["company"])) {
    echo json_encode([
        "success" => false,
        "error" => "Missing required fields."
    ]);
    exit;
}

$name = trim($_POST["name"]);
$email = trim($_POST["email"]);
$message = trim($_POST["message"]);
$phone = trim($_POST["phone"]);
$company = trim($_POST["company"]);

if ($name === "" || $email === "" || $message === "") {
    echo json_encode([
        "success" => false,
        "error" => "Name, email, and message cannot be empty."
    ]);
    exit;
}


require __DIR__ . '/vendor/autoload.php';

use Google\Client;
use Google\Service\Sheets;

try {
    
    $client = new Client();
    $client->setAuthConfig('credentials.json'); 
    $client->addScope(Sheets::SPREADSHEETS);

    $service = new Sheets($client);

    
    $spreadsheetId = "1NHehLN8Xbn07xOFE8O0iyuxonARpKX1HzWM6SlkDfVY"; 
    $range = "LiveDB!A:F"; 

   
    $response = $service->spreadsheets_values->get($spreadsheetId, 'A:A');
    $rows = $response->getValues();
    $lastSerial = count($rows);
    $serialNumber = $lastSerial;

    
    $values = [[
        $serialNumber,
        $name,
        $email,
        $phone,
        $company,
        $message
    ]];

    $body = new Sheets\ValueRange([
        "values" => $values
    ]);

    $params = [
        "valueInputOption" => "RAW"
    ];

    
    $result = $service->spreadsheets_values->append(
        $spreadsheetId,
        $range,
        $body,
        $params
    );

    echo json_encode([
        "success" => true,
        "message" => "Data saved successfully.",
        "updatedRange" => $result->getUpdates()->getUpdatedRange()
    ]);

} catch (Exception $e) {
    
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
    exit;
}
?>
