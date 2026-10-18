/**
 * Generic HTML Form Mock Fixture
 * Matches typical simple employer-hosted career page form
 */

export const GENERIC_FORM_MOCK_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Acme Corp - Job Application</title>
</head>
<body>
  <div class="career-apply-wrapper">
    <h1>Software Developer</h1>
    <h3>Acme Corp · Remote</h3>

    <form id="job-apply-form" action="https://careers.acmecorp.com/apply" method="POST" enctype="multipart/form-data">
      <div class="form-group">
        <label for="applicant_name">Your Name *</label>
        <input type="text" id="applicant_name" name="applicant_name" required="required" />
      </div>

      <div class="form-group">
        <label for="applicant_email">Email Address *</label>
        <input type="email" id="applicant_email" name="applicant_email" required="required" />
      </div>

      <div class="form-group">
        <label for="applicant_phone">Phone Number *</label>
        <input type="tel" id="applicant_phone" name="applicant_phone" required="required" />
      </div>

      <div class="form-group">
        <label for="resume_file">Attach Resume *</label>
        <input type="file" id="resume_file" name="resume_file" required="required" accept=".pdf,.docx" />
      </div>

      <div class="form-group">
        <label for="experience_years">Years of Experience</label>
        <input type="number" id="experience_years" name="experience_years" min="0" />
      </div>

      <div class="form-group">
        <label for="portfolio_url">Portfolio or Website</label>
        <input type="url" id="portfolio_url" name="portfolio_url" />
      </div>

      <div class="form-group">
        <button type="submit" id="submit-btn" class="btn btn-primary">Apply Now</button>
      </div>
    </form>
  </div>
</body>
</html>
`;

export const GENERIC_SUBMISSION_SUCCESS_HTML = `
<!DOCTYPE html>
<html lang="en">
<head><title>Thank you</title></head>
<body>
  <div class="confirmation-box">
    <h2>Thank you for applying</h2>
    <p>We've received your application and will be in touch soon.</p>
  </div>
</body>
</html>
`;
