import { PRINT_SERVER } from '../config.js';

export async function sendPrint(order) {
  try {
    const r = await fetch(`${PRINT_SERVER}/print`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(order)
    });
    return await r.json();
  } catch (e) {
    return {
      success: false
    };
  }
}
export async function sendPrintCuisine(order) {
  try {
    const r = await fetch(`${PRINT_SERVER}/print-cuisine`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(order)
    });
    return await r.json();
  } catch (e) {
    return {
      success: false
    };
  }
}
export async function sendPrintCaisse(order) {
  try {
    const r = await fetch(`${PRINT_SERVER}/print-caisse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(order)
    });
    return await r.json();
  } catch (e) {
    return {
      success: false
    };
  }
}

export async function sendDailyReport(dateStr, dayOrders, screenshot) {
  try {
    const r = await fetch(`${PRINT_SERVER}/send-daily-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        date: dateStr,
        orders: dayOrders,
        screenshot: screenshot || null
      })
    });
    return await r.json();
  } catch (e) {
    return {
      success: false,
      error: e.message
    };
  }
}
