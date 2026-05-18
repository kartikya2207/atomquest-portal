import resend
import os
from dotenv import load_dotenv
from app.models.user import User

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")

def send_goal_notification(user: User, notification_type: str, comment: str = None):
    """
    notification_type: 'submitted', 'approved', 'returned'
    """
    subjects = {
        "submitted": "Goal Sheet Submitted for Approval",
        "approved": "Your Goal Sheet has been Approved",
        "returned": "Action Required: Goal Sheet Returned for Rework",
    }
    
    templates = {
        "submitted": f"Hello Manager, {user.name} has submitted their goal sheet for your review.",
        "approved": f"Hi {user.name}, your goal sheet has been approved and locked for the current cycle.",
        "returned": f"Hi {user.name}, your goal sheet has been returned for rework. Manager comment: {comment}",
    }

    try:
        # In a real app, 'submitted' goes to the manager. 
        # For this hackathon, we'll send to the user's email if provided, 
        # but since we might be using fake emails, we'll just log it if it fails.
        
        # Determine recipient
        recipient = user.email
        # if notification_type == "submitted":
        #    recipient = user.manager.email # if manager exists
        
        params = {
            "from": "AtomQuest <onboarding@resend.dev>", # Standard Resend testing address
            "to": [recipient],
            "subject": subjects.get(notification_type, "AtomQuest Notification"),
            "html": f"<p>{templates.get(notification_type, '')}</p>",
        }

        resend.Emails.send(params)
    except Exception as e:
        print(f"Failed to send email: {e}")
