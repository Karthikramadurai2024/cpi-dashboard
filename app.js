// Load tenants.json and populate dropdown
fetch('tenants.json')
    .then(response => response.json())
    .then(tenants => {
        const tenantSelect = document.getElementById('tenant');
        tenants.forEach(t => {
            const option = document.createElement('option');
            option.value = t.name;
            option.textContent = t.name;
            tenantSelect.appendChild(option);
        });
    });

document.getElementById('fetchBtn').addEventListener('click', async () => {
    const tenantName = document.getElementById('tenant').value;
    const startDate = document.getElementById('start').value;
    const endDate = document.getElementById('end').value;

    const tenants = await fetch('tenants.json').then(r => r.json());
    const tenant = tenants.find(t => t.name === tenantName);

    if (!tenant) return alert('Tenant not found!');

    const url = `${tenant.url}?startDate=${startDate}&endDate=${endDate}`;
    
    // Basic auth if needed
    const headers = new Headers();
    headers.set('Authorization', 'Basic ' + btoa(`${tenant.username}:${tenant.password}`));

    try {
        const response = await fetch(url, { headers });
        const xmlText = await response.text();

        // Parse XML to table
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");

        let table = '<table border="1"><tr>';
        const firstRow = xmlDoc.querySelectorAll('*')[0].children;
        for (let i = 0; i < firstRow.length; i++) {
            table += `<th>${firstRow[i].nodeName}</th>`;
        }
        table += '</tr>';

        const rows = xmlDoc.querySelectorAll(firstRow[0].parentNode.nodeName);
        rows.forEach(row => {
            table += '<tr>';
            for (let i = 0; i < row.children.length; i++) {
                table += `<td>${row.children[i].textContent}</td>`;
            }
            table += '</tr>';
        });

        table += '</table>';
        document.getElementById('result').innerHTML = table;
    } catch (err) {
        document.getElementById('result').textContent = 'Error fetching logs: ' + err;
    }
});
