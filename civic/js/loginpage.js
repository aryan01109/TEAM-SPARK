(function(){
      const roleSelect = document.getElementById('roleSelect');
      const userFields = document.getElementById('userFields');
      const adminFields = document.getElementById('adminFields');
      const form = document.getElementById('loginForm');
      const submitBtn = document.getElementById('submitBtn');
      const generalError = document.getElementById('generalError');

      // clear stored auth on load
      try { localStorage.removeItem('token'); localStorage.removeItem('role'); localStorage.removeItem('username'); } catch(e){}

      function showRoleFields(){
        if(roleSelect.value === 'User'){
          userFields.style.display = '';
          adminFields.style.display = 'none';
        } else {
          userFields.style.display = 'none';
          adminFields.style.display = '';
        }
        clearErrors();
      }

      function clearErrors(){
        generalError.style.display = 'none';
        ['identifierError','passwordError','securityCodeError','govIdError','adminPasswordError'].forEach(id => {
          const el = document.getElementById(id); if(el){ el.style.display='none'; el.textContent=''; }
        });
      }

      function validate(){
        const errors = {};
        if(roleSelect.value === 'User'){
          const identifier = document.getElementById('identifier').value.trim();
          const password = document.getElementById('password').value.trim();
          if(!identifier) errors.identifier = 'Required';
          if(!password) errors.password = 'Required';
        } else {
          const govId = document.getElementById('govId').value.trim();
          const adminPassword = document.getElementById('adminPassword').value.trim();
          if(!govId) errors.govId = 'Government ID required';
          if(!adminPassword) errors.adminPassword = 'Password required';
        }
        return errors;
      }

      roleSelect.addEventListener('change', showRoleFields);

      form.addEventListener('submit', async function(e){
        e.preventDefault();
        clearErrors();
        const errs = validate();
        if(Object.keys(errs).length){
          if(errs.identifier) { const el=document.getElementById('identifierError'); el.textContent=errs.identifier; el.style.display='block'; }
          if(errs.password) { const el=document.getElementById('passwordError'); el.textContent=errs.password; el.style.display='block'; }
          if(errs.govId) { const el=document.getElementById('govIdError'); el.textContent=errs.govId; el.style.display='block'; }
          if(errs.adminPassword) { const el=document.getElementById('adminPasswordError'); el.textContent=errs.adminPassword; el.style.display='block'; }
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        const role = roleSelect.value;
        let payload;
        if(role === 'User'){
          payload = { identifier: document.getElementById('identifier').value.trim(), password: document.getElementById('password').value.trim() };
        } else {
          payload = { govId: document.getElementById('govId').value.trim(), adminPassword: document.getElementById('adminPassword').value.trim() };
        }

        try{
          const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if(!res.ok){
            if(res.status === 401){
              // show invalid creds on relevant fields
              const msg = 'Invalid credentials';
              if(role==='User'){
                document.getElementById('identifierError').textContent = msg; document.getElementById('identifierError').style.display='block';
                document.getElementById('passwordError').textContent = msg; document.getElementById('passwordError').style.display='block';
              } else {
                document.getElementById('govIdError').textContent = msg; document.getElementById('govIdError').style.display='block';
                document.getElementById('adminPasswordError').textContent = msg; document.getElementById('adminPasswordError').style.display='block';
              }
            } else {
              generalError.textContent = data.message || 'Login failed. Please try again.'; generalError.style.display='block';
            }
            return;
          }

          // on success, expect { token, role, username }
          if(data.token){
            try{ localStorage.setItem('token', data.token); localStorage.setItem('role', data.role || (role==='User'?'user':'admin')); localStorage.setItem('username', data.username || (payload.identifier||payload.govId)); }catch(e){}
          }

          if(role === 'User'){
            window.location.href = 'UserDashboard.html';
          } else {
            if(data.role === 'admin' || data.isAdmin) window.location.href = 'AdminDashboard.html';
            else { document.getElementById('govIdError').textContent = 'Invalid admin credentials'; document.getElementById('govIdError').style.display='block'; }
          }

        } catch(err){
          console.error('Login error', err);
          generalError.textContent = 'Login failed. Please try again.'; generalError.style.display='block';
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Login';
        }
      });

      // initialize
      showRoleFields();
    })();