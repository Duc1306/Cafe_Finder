"use client"

import { useState } from "react"
import { Edit2 } from "lucide-react"
import { Button, Card } from "antd"


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

export default function TermsPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [terms, setTerms] = useState(TERMS_CONTENT)
  const [tempTerms, setTempTerms] = useState(TERMS_CONTENT)

  const handleEdit = () => {
    setIsEditing(true)
    setTempTerms(terms)
  }

  const handleSave = () => {
    setTerms(tempTerms)
    setIsEditing(false)
    alert("Terms and Conditions updated successfully!")
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

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
        {!isEditing && (
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleEdit}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      {/* Terms Content */}
      <Card className="p-8 bg-card">
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={tempTerms}
              onChange={(e) => setTempTerms(e.target.value)}
              rows={20}
              className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">{terms}</div>
        )}
      </Card>

      {/* Notification Settings */}
      {!isEditing && (
        <Card className="p-6 bg-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Change Notification Settings</h2>
          <p className="text-muted-foreground mb-4">Users will be notified of terms changes via:</p>
          <ul className="space-y-2 text-sm text-foreground">
            <li>• Email notification to registered email addresses</li>
            <li>• In-app notification banner</li>
            <li>• News feed update</li>
          </ul>
        </Card>
      )}
    </div>
  )
}