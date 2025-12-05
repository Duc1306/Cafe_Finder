"use client"

import { Card } from "antd"

const TERMS_CONTENT = `
Version 2.3 - Last updated: October 2025

1. SERVICE TERMS
These Terms and Conditions govern the use of the Cafe Finder application and website.

2. USER RESPONSIBILITIES
Users must use the service in compliance with all applicable laws and regulations.

3. PRIVACY AND SECURITY
We are committed to protecting user privacy and maintaining data security.

4. PAYMENTS AND BILLING
All payments must be made in accordance with the specified payment terms.

5. INTELLECTUAL PROPERTY
All content on the platform is protected by intellectual property laws.

6. LIMITATION OF LIABILITY
We are not liable for any indirect or consequential damages.

7. TERMINATION
We reserve the right to terminate accounts that violate these terms.

8. CHANGES TO TERMS
We may update these terms at any time. Users will be notified of changes via email.

For inquiries, please contact: support@cafefinder.com
`

export function Terms() {
  
 return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Terms and Conditions</h1>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Version 2.3</span>
            <span>Published</span>
          </div>
        </div>
      </div>
     {/* Terms Content */}
      <Card className="p-8 bg-card">
        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">{TERMS_CONTENT}</div>
      </Card>
    </div>
  )
}