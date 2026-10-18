/**
 * Lever ATS Mock HTML Fixture
 * Matches typical Lever job postings application form DOM structure
 */

export const LEVER_MOCK_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Stripe - Full Stack Engineer (Lever)</title>
</head>
<body>
  <div class="application-page">
    <div class="posting-headline">
      <h2>Full Stack Engineer</h2>
      <div class="posting-categories">San Francisco, CA / Engineering / Full-time</div>
    </div>

    <form class="application-form" id="application-form" action="https://jobs.lever.co/stripe/99123/apply" method="POST" enctype="multipart/form-data">
      <div class="application-field">
        <label>Full Name <span class="required">*</span></label>
        <input type="text" name="name" required="required" autocomplete="name" />
      </div>

      <div class="application-field">
        <label>Email <span class="required">*</span></label>
        <input type="email" name="email" required="required" autocomplete="email" />
      </div>

      <div class="application-field">
        <label>Phone <span class="required">*</span></label>
        <input type="tel" name="phone" required="required" autocomplete="tel" />
      </div>

      <div class="application-field">
        <label>Current Company</label>
        <input type="text" name="org" placeholder="Current or most recent employer" />
      </div>

      <div class="application-field">
        <label>Resume/CV <span class="required">*</span></label>
        <input type="file" name="resume" required="required" accept=".pdf,.doc,.docx" />
      </div>

      <div class="application-field">
        <label>LinkedIn URL</label>
        <input type="url" name="urls[LinkedIn]" placeholder="https://www.linkedin.com/in/..." />
      </div>

      <div class="application-field">
        <label>GitHub URL</label>
        <input type="url" name="urls[GitHub]" placeholder="https://github.com/..." />
      </div>

      <div class="application-field">
        <label>Are you authorized to work in the United States? <span class="required">*</span></label>
        <div class="custom-card-options">
          <label><input type="radio" name="cards[0][field]" value="Yes" required="required" /> Yes</label>
          <label><input type="radio" name="cards[0][field]" value="No" required="required" /> No</label>
        </div>
      </div>

      <div class="application-field">
        <label>Will you now or in the future require visa sponsorship? <span class="required">*</span></label>
        <div class="custom-card-options">
          <label><input type="radio" name="cards[1][field]" value="Yes" required="required" /> Yes</label>
          <label><input type="radio" name="cards[1][field]" value="No" required="required" /> No</label>
        </div>
      </div>

      <div class="application-field">
        <label>Additional Information</label>
        <textarea name="comments" placeholder="Add a cover letter or any additional comments..."></textarea>
      </div>

      <div class="application-actions">
        <button type="submit" id="btn-submit" class="template-btn-submit">Submit application</button>
      </div>
    </form>
  </div>
</body>
</html>
`;

export const LEVER_SUBMISSION_SUCCESS_HTML = `
<!DOCTYPE html>
<html lang="en">
<head><title>Application submitted</title></head>
<body>
  <div class="application-confirmation">
    <h2>Application submitted</h2>
    <p>Thank you for your interest in Stripe! We've received your application.</p>
  </div>
</body>
</html>
`;
