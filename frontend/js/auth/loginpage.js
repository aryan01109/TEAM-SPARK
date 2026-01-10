(function(){
      const roleSelect = document.getElementById('roleSelect');
      const userFields = document.getElementById('userFields');
      const adminFields = document.getElementById('adminFields');
      const form = document.getElementById('loginForm');
      const submitBtn = document.getElementById('submitBtn');
      const generalError = document.getElementById('generalError');

      // clear stored auth on load
      try { localStorage.removeItem('token'); localStorage.removeItem('role'); localStorage.removeItem('username'); } catch(e){}

        try{
          const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const isLocalHost = (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '');

          // If API missing on local dev, allow a safe fallback so redirects can be tested
          if(!res.ok){
            if(res.status === 401){
              const msg = 'Invalid credentials';
              if(role==='User'){
                document.getElementById('identifierError').textContent = msg; document.getElementById('identifierError').style.display='block';
                document.getElementById('passwordError').textContent = msg; document.getElementById('passwordError').style.display='block';
              } else {
                document.getElementById('govIdError').textContent = msg; document.getElementById('govIdError').style.display='block';
                document.getElementById('adminPasswordError').textContent = msg; document.getElementById('adminPasswordError').style.display='block';
              }
              submitBtn.disabled = false;
              submitBtn.textContent = 'Login';
              return;
            }

            // If we're on localhost and the endpoint is missing, simulate success for testing
            if(isLocalHost && (res.status === 404 || res.status === 0)){
              console.warn('API /api/login not found — using local dev fallback');
              const data = { token: 'local-token', role: role === 'User' ? 'user' : 'admin', username: payload.identifier || payload.govId || 'local' };
              try{ localStorage.setItem('token', data.token); localStorage.setItem('role', data.role); localStorage.setItem('username', data.username); }catch(e){}
              if(role === 'User') window.location.href = '../user/UserDashboard.html';
              else window.location.href = '../admin/AdminDashboard.html';
              return;
            }

            const data = await res.json().catch(()=>({}));
            generalError.textContent = data.message || 'Login failed. Please try again.'; generalError.style.display='block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
            return;
          }

          const data = await res.json().catch(()=>({}));

          // on success, expect { token, role, username }
          if(data.token){
            try{ localStorage.setItem('token', data.token); localStorage.setItem('role', data.role || (role==='User'?'user':'admin')); localStorage.setItem('username', data.username || (payload.identifier||payload.govId)); }catch(e){}
          }

          if(role === 'User'){
            window.location.href = '../user/UserDashboard.html';
          } else {
            if(data.role === 'admin' || data.isAdmin) window.location.href = '../admin/AdminDashboard.html';
            else { document.getElementById('govIdError').textContent = 'Invalid admin credentials'; document.getElementById('govIdError').style.display='block'; }
          }

        } catch(err){
          const isLocalHost = (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '');
          if(isLocalHost){
            console.warn('Network error contacting /api/login — using local dev fallback', err);
            const data = { token: 'local-token', role: role === 'User' ? 'user' : 'admin', username: payload.identifier || payload.govId || 'local' };
            try{ localStorage.setItem('token', data.token); localStorage.setItem('role', data.role); localStorage.setItem('username', data.username); }catch(e){}
            if(role === 'User') window.location.href = '../user/UserDashboard.html';
            else window.location.href = '../admin/AdminDashboard.html';
            return;
          }

          console.error('Login error', err);
          generalError.textContent = 'Login failed. Please try again.'; generalError.style.display='block';
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Login';
        }
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
            window.location.href = '../user/UserDashboard.html';
          } else {
            if(data.role === 'admin' || data.isAdmin) window.location.href = '../admin/AdminDashboard.html';
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