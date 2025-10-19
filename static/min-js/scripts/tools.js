async function processAndSubmitForm(e,t){e.preventDefault();var s,r,a,e=t.closest("form");if(e)try{e.checkValidity()?(s=await grecaptcha.execute("6Lf4b68qAAAAAC-7ubJT6SZQtzOkheapS0gR4wMb",{action:"submit"}),(r=document.createElement("input")).type="hidden",r.name="g-recaptcha-response",r.value=s,e.append(r),e.hasAttribute("action")?((a=e.querySelector(".loader"))&&(a.style.display="block"),e.submit()):e.onsubmit&&e.onsubmit(e)):e.reportValidity()}catch(e){console.error("An error occurred",e)}else console.error("No parent form found!")}function addReCaptchaError(){var e=document.querySelector("#recaptcha-error");e.innerHTML=`
  <div class="alert alert-warning alert-dismissible fade show" role="alert" id="autoDismissAlert">
      <strong>ReCaptcha!</strong> ReCaptcha Validation Failed
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`,e.style.display="block",setTimeout(function(){var e=document.getElementById("autoDismissAlert");e&&new bootstrap.Alert(e).close()},5e3)}function addLimitErrorAlert(e){var t=document.querySelector("#userlimit-error");t.innerHTML=`
  <div class="alert alert-danger alert-dismissible fade show" role="alert" id="autoDismissAlert">
      <strong>User Limit Exceeded!</strong> ${e?"Upgrade Plan":"Kindly Login"}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`,t.style.display="block",setTimeout(function(){var e=document.getElementById("autoDismissAlert");e&&new bootstrap.Alert(e).close()},5e3)}function addActionAlert(e){var t=document.querySelector("#actions");t.innerHTML=`
  <div class="alert alert-success alert-dismissible fade show" role="alert" id="autoDismissAlert">
      ${e}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`,t.style.display="block",setTimeout(function(){var e=document.getElementById("autoDismissAlert");e&&new bootstrap.Alert(e).close()},5e3)}