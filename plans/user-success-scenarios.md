# User Success Scenarios

These scenarios describe real-world usage patterns that the portfolio builder should support. They help clarify the user value without prescribing specific implementation approaches.

## Primary User Personas

### Sarah Chen - Theatre Costume Designer
- Works on multiple productions simultaneously
- Needs to showcase work to directors and producers
- Often updates portfolio from backstage or on set
- Values visual impact and professional presentation

### Marcus Williams - Freelance Fashion Designer
- Building his first professional web presence
- Not technically savvy but visually sophisticated
- Wants to look established despite being new
- Updates portfolio after each photoshoot

### Emma Rodriguez - Film Costume Supervisor
- Has 20+ years of work to showcase
- Needs to organize work by production, year, and style
- Requires password protection for unreleased work
- Often shares specific project pages with potential clients

---

## Core Success Scenarios

### Scenario 1: First Portfolio Creation
**User**: Marcus (new freelancer)
**Context**: Just finished his first professional photoshoot
**Success Criteria**: Creates and publishes a professional portfolio in under 30 minutes

**Journey**:
1. Marcus discovers the portfolio builder through a colleague's recommendation
2. He signs up and is welcomed with a clear starting point
3. He selects a theme that matches his aesthetic vision
4. He adds his business name and tagline
5. He uploads 10 photos from his recent shoot
6. He adds descriptions for each piece
7. He previews how it will look to visitors
8. He publishes his portfolio and shares the link on Instagram
9. His portfolio looks professional and loads quickly on phones

**Key Moments**:
- Theme selection immediately shows him what's possible
- Photo upload handles his high-resolution images gracefully
- Preview gives him confidence before publishing
- Published site impresses his potential clients

---

### Scenario 2: Mobile Update from Set
**User**: Sarah (experienced costume designer)
**Context**: On set for a theatre production, wants to add photos immediately
**Success Criteria**: Updates portfolio from phone in under 5 minutes

**Journey**:
1. Sarah takes photos of the lead actor in costume during dress rehearsal
2. Opens the portfolio builder on her iPhone
3. Navigates to her "Current Productions" page
4. Adds photos directly from her camera roll
5. Adds quick captions while the details are fresh
6. Publishes the update
7. Texts the link to the director

**Key Moments**:
- Mobile interface is fully functional, not a stripped-down version
- Photo upload works smoothly even on theatre WiFi
- Can complete the entire update without switching to desktop
- Changes are live immediately for the director to see

---

### Scenario 3: Organizing Decades of Work
**User**: Emma (veteran professional)
**Context**: Migrating from an outdated website to modern portfolio
**Success Criteria**: Creates organized, navigable portfolio with 50+ projects

**Journey**:
1. Emma logs in and chooses a classic, elegant theme
2. Creates main pages: Film Work, Television, Theatre, Awards
3. Within Film Work, creates sub-pages for each major production
4. Uploads production stills and costume sketches for each
5. Adds detailed credits and collaborator information
6. Sets certain pages as password-protected (unreleased films)
7. Creates a highlights reel on the homepage
8. Publishes and redirects her old domain

**Key Moments**:
- Page organization supports her complex categorization needs
- Bulk upload handles dozens of images efficiently
- Password protection gives her control over sensitive content
- Navigation remains clear despite extensive content

---

### Scenario 4: Quick Theme Change for Different Audience
**User**: Sarah
**Context**: Needs to pitch to a modern dance company (usually does classical theatre)
**Success Criteria**: Adapts portfolio presentation in under 10 minutes

**Journey**:
1. Sarah has a meeting in 30 minutes with a contemporary dance company
2. Logs in and switches from her "Classic Elegant" theme to "Modern Minimal"
3. Reorders her homepage to feature contemporary work first
4. Hides her Shakespeare and period drama pages temporarily
5. Updates her tagline to emphasize movement and innovation
6. Previews the changes to ensure they look cohesive
7. Publishes the targeted version
8. Presents confidently knowing her portfolio aligns with the client

**Key Moments**:
- Theme switch preserves all content and structure
- Can quickly reorganize without rebuilding
- Preview confirms the new look works
- Publishing is fast enough for last-minute adjustments

---

### Scenario 5: Collaborative Review Process
**User**: Marcus
**Context**: Getting feedback from his mentor before going live
**Success Criteria**: Shares work for review without publishing publicly

**Journey**:
1. Marcus completes his portfolio draft
2. Generates a preview link with 48-hour expiration
3. Sends link to his mentor for feedback
4. Mentor views on tablet, suggests reordering some pieces
5. Marcus makes the adjustments in real-time during their video call
6. They review the changes together via screen share
7. After approval, Marcus publishes with confidence

**Key Moments**:
- Preview link works without requiring login
- Real-time editing enables collaborative review
- Changes are visible immediately in preview
- Publishing after review feels safe and confident

---

## Validation Questions

After implementation, can your portfolio builder support these scenarios? Consider:

1. **Time to Success**: Can each scenario be completed within the stated timeframe?
2. **Mobile Experience**: Do mobile scenarios work as smoothly as described?
3. **User Confidence**: Would users feel confident at each key moment?
4. **Professional Result**: Would the published portfolios impress potential clients?
5. **Real-World Conditions**: Do scenarios work on slower connections and older devices?

---

## Edge Cases to Consider

While not primary scenarios, the system should gracefully handle:

- User uploads 100+ images at once
- User's session expires while editing
- User tries to publish with missing required information
- User accidentally deletes important content
- User's browser crashes mid-edit
- User switches between devices while editing
- User has poor internet connection
- User tries to upload an unsupported file type

These scenarios help validate that the portfolio builder serves real creative professionals in realistic working conditions.

---

## Test User Credentials

For realistic testing, implement these user accounts with the provided test assets:

**Sarah Chen (Theatre Designer)**
- Email: sarah.chen@test.costume.design
- Password: TheatrePro2024!
- Role: Experienced theatre costume designer
- Test Data: See `test-assets/user-profiles/sarah-chen/`

**Marcus Williams (New Freelancer)**
- Email: marcus.williams@test.costume.design
- Password: FirstPortfolio2024!
- Role: New freelance fashion designer
- Test Data: See `test-assets/user-profiles/marcus-williams/`

**Emma Rodriguez (Film Supervisor)**
- Email: emma.rodriguez@test.costume.design
- Password: FilmVeteran2024!
- Role: Veteran film costume supervisor
- Test Data: See `test-assets/user-profiles/emma-rodriguez/`

**Generic Test Account**
- Email: test@costume.design
- Password: TestUser2024!
- Role: Basic testing account with minimal data
- Test Data: See `test-assets/basic-testing/`

### Implementation Notes

- Pre-seed these accounts with profile data from their respective JSON files
- Use the provided images and content for realistic portfolio testing
- Test credentials should work immediately after setup
- Each account represents different complexity levels for comprehensive testing