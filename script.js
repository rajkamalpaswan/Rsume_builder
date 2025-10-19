// script.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('resume-form');
  const generateBtn = document.getElementById('generateBtn');
  const submitBtn = document.getElementById('submitBtn');

  // Populate PDF template from form fields
  function populateTemplate() {
    const get = name => (form.elements[name] ? form.elements[name].value.trim() : '');

    // Personal
    document.getElementById('pdf-name').textContent = get('name') || 'FULL NAME';
    const contact = `${get('email') || ''} ${get('phone') ? ' | ' + get('phone') : ''} ${get('location') ? ' | ' + get('location') : ''}`;
    document.getElementById('pdf-contact').textContent = contact;
    document.getElementById('pdf-links').textContent = get('linkedin') || '';

    // Summary (not printed in template top but can be added)
    // Education
    document.getElementById('pdf-degree').textContent = get('degree') || '';
    document.getElementById('pdf-college').textContent = get('college') + (get('edu_year') ? ' • ' + get('edu_year') : '');
    document.getElementById('pdf-grade').textContent = get('grade') ? 'CGPA/Percentage: ' + get('grade') : '';

    // Experience
    document.getElementById('pdf-jobtitle').textContent = get('job_title') || '';
    document.getElementById('pdf-company').textContent = get('company') || '';
    document.getElementById('pdf-jobperiod').textContent = get('job_period') + (get('job_location') ? ' • ' + get('job_location') : '');

    const jobBullets = (get('job_bullets') || '').split('\n').map(s => s.trim()).filter(Boolean);
    const jobUl = document.getElementById('pdf-jobbullets');
    jobUl.innerHTML = '';
    jobBullets.forEach(b => {
      const li = document.createElement('li'); li.textContent = b; jobUl.appendChild(li);
    });

    // Projects
    document.getElementById('pdf-projectname').textContent = get('project_name') || '';
    document.getElementById('pdf-projecttools').textContent = get('project_tools') || '';
    const projItems = (get('project_desc') || '').split('\n').map(s => s.trim()).filter(Boolean);
    const projUl = document.getElementById('pdf-projectdesc');
    projUl.innerHTML = '';
    projItems.forEach(p => { const li = document.createElement('li'); li.textContent = p; projUl.appendChild(li); });

    // Skills
    document.getElementById('pdf-tech').textContent = (get('tech_skills') || '').split(',').map(s => s.trim()).filter(Boolean).join(', ');
    document.getElementById('pdf-soft').textContent = (get('soft_skills') || '').split(',').map(s => s.trim()).filter(Boolean).join(', ');

    // Certs
    const certs = (get('certs') || '').split('\n').map(s => s.trim()).filter(Boolean);
    const certUl = document.getElementById('pdf-certs');
    certUl.innerHTML = '';
    certs.forEach(c => { const li = document.createElement('li'); li.textContent = c; certUl.appendChild(li); });
  }

  function generatePDF(filename = 'Resume.pdf') {
    populateTemplate();
    const element = document.getElementById('pdf-template');
    const opt = {
      margin:       10,
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    // html2pdf returns a promise
    html2pdf().set(opt).from(element).save();
  }

  // Option: send copy to Formspree (or another webhook)
  async function sendCopyToEndpoint() {
    const endpoint = document.getElementById('sendEndpoint').value.trim();
    if(!endpoint) {
      alert('No send endpoint configured. To enable sending copies, set a Formspree (or webhook) endpoint in the hidden input "sendEndpoint".');
      return;
    }

    // gather data
    const data = {};
    for (let el of form.elements) {
      if (!el.name) continue;
      data[el.name] = el.value;
    }

    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(data)
      });
      if (resp.ok) {
        alert('A copy has been sent to your configured endpoint.');
      } else {
        alert('Send failed. Check your endpoint settings.');
      }
    } catch (err) {
      console.error(err);
      alert('Error while sending copy. Check console.');
    }
  }

  // Events
  generateBtn.addEventListener('click', () => {
    generatePDF(`${(form.elements['name'] && form.elements['name'].value) ? form.elements['name'].value + '-Resume' : 'Resume'}.pdf`);
  });

  submitBtn.addEventListener('click', async () => {
    // generate first
    generatePDF(`${(form.elements['name'] && form.elements['name'].value) ? form.elements['name'].value + '-Resume' : 'Resume'}.pdf`);
    // then attempt to send (optional)
    await sendCopyToEndpoint();
  });
});
