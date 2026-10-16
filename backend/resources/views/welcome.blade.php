<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ஊஞ்சல் Chai API Backend</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #09090b;
            color: #fbf8f1;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            min-height: 100vh;
            align-items: center;
            justify-content: center;
        }
        .card {
            background-color: #141416;
            border: 1px solid #27272a;
            border-radius: 16px;
            padding: 2.5rem;
            max-width: 480px;
            width: 90%;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        }
        .badge {
            display: inline-block;
            background-color: rgba(217, 119, 6, 0.15);
            color: #f59e0b;
            border: 1px solid rgba(217, 119, 6, 0.3);
            border-radius: 9999px;
            padding: 0.25rem 0.75rem;
            font-size: 0.75rem;
            font-weight: 600;
            margin-bottom: 1rem;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }
        h1 {
            color: #d97706;
            margin: 0 0 0.5rem 0;
            font-size: 1.75rem;
            font-weight: 700;
        }
        p {
            color: #a1a1aa;
            font-size: 0.95rem;
            line-height: 1.5;
            margin: 0 0 1.5rem 0;
        }
        .status-dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            background-color: #10b981;
            border-radius: 50%;
            margin-right: 6px;
        }
        .status-box {
            background-color: #18181b;
            border: 1px solid #27272a;
            border-radius: 8px;
            padding: 0.75rem;
            font-size: 0.85rem;
            color: #e4e4e7;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        a {
            color: #d97706;
            text-decoration: none;
            font-weight: 500;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="badge">Oonjal Chai POS</div>
        <h1>ஊஞ்சல் Chai API</h1>
        <p>Sri Lankan Chai Cafe, Fast Food &amp; POS Management System Backend.</p>
        <div class="status-box">
            <span class="status-dot"></span>
            <span>Laravel 12 API Service Running (Port 8000)</span>
        </div>
        <p style="margin-top: 1.5rem; font-size: 0.8rem; color: #71717a;">
            Frontend Client: <a href="http://127.0.0.1:5173" target="_blank">http://127.0.0.1:5173</a>
        </p>
    </div>
</body>
</html>
