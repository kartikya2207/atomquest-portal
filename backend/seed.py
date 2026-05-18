from app.database import SessionLocal
from app.models import User, UserRole, ThrustArea, Cycle, Goal, GoalStatus, UoMType, Achievement, AchievementStatus, Quarter, Checkin, AuditLog
from app.auth.utils import get_password_hash
from datetime import date, datetime, timedelta

def seed():
    db = SessionLocal()
    
    # 1. Clear existing data
    db.query(AuditLog).delete()
    db.query(Achievement).delete()
    db.query(Checkin).delete()
    db.query(Goal).delete()
    db.query(ThrustArea).delete()
    db.query(Cycle).delete()
    db.query(User).delete()
    db.commit()

    print("Seeding Thrust Areas...")
    thrust_areas_names = [
        "Sales Revenue", "Product Quality", "Customer NPS", "Energy Efficiency",
        "On-time Delivery", "Cost Reduction", "Safety", "Innovation & R&D"
    ]
    thrust_areas = {}
    for name in thrust_areas_names:
        ta = db.query(ThrustArea).filter(ThrustArea.name == name).first()
        if not ta:
            ta = ThrustArea(name=name, description=f"{name} thrust area")
            db.add(ta)
            db.flush()
        thrust_areas[name] = ta

    print("Seeding Users...")
    password_hash = get_password_hash("Atomberg@123")
    
    user_data = [
        ("admin@atomberg.com", "Admin User", UserRole.ADMIN, None, "HR", "HR Head"),
        ("priya.sharma@atomberg.com", "Priya Sharma", UserRole.MANAGER, "admin@atomberg.com", "Sales North", "Regional Sales Manager"),
        ("rajesh.kumar@atomberg.com", "Rajesh Kumar", UserRole.MANAGER, "admin@atomberg.com", "R&D", "R&D Lead"),
        ("anjali.iyer@atomberg.com", "Anjali Iyer", UserRole.EMPLOYEE, "priya.sharma@atomberg.com", "Sales North", "Sales Executive (Delhi)"),
        ("vikram.singh@atomberg.com", "Vikram Singh", UserRole.EMPLOYEE, "priya.sharma@atomberg.com", "Sales North", "Sales Executive (Mumbai)"),
        ("sneha.patel@atomberg.com", "Sneha Patel", UserRole.EMPLOYEE, "priya.sharma@atomberg.com", "Sales North", "Sales Executive (Pune)"),
        ("arjun.mehta@atomberg.com", "Arjun Mehta", UserRole.EMPLOYEE, "rajesh.kumar@atomberg.com", "R&D", "BLDC Motor Engineer"),
        ("kavya.reddy@atomberg.com", "Kavya Reddy", UserRole.EMPLOYEE, "rajesh.kumar@atomberg.com", "R&D", "Embedded Systems Engineer"),
    ]

    users = {}
    # First pass to create users
    for email, name, role, manager_email, dept, desig in user_data:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                name=name,
                password_hash=password_hash,
                role=role,
                department=dept,
                designation=desig
            )
            db.add(user)
            db.flush()
        users[email] = user

    # Second pass to set manager_id
    for email, name, role, manager_email, dept, desig in user_data:
        if manager_email:
            users[email].manager_id = users[manager_email].id
    db.commit()

    print("Seeding Cycles...")
    # Active Cycle
    today = date(2026, 5, 16)
    active_cycle = db.query(Cycle).filter(Cycle.name == "FY 2026-27").first()
    if not active_cycle:
        active_cycle = Cycle(
            name="FY 2026-27",
            year=2026,
            goal_setting_open=date(2026, 5, 1),
            goal_setting_close=date(2026, 6, 15),
            q1_open=date(2026, 5, 1),
            q1_close=date(2026, 6, 30),
            q2_open=date(2026, 7, 1),
            q2_close=date(2026, 9, 30),
            q3_open=date(2026, 10, 1),
            q3_close=date(2026, 12, 31),
            q4_open=date(2027, 1, 1),
            q4_close=date(2027, 3, 31),
            is_active=True
        )
        db.add(active_cycle)
        db.flush()

    # Previous Cycle
    prev_cycle = db.query(Cycle).filter(Cycle.name == "FY 2025-26").first()
    if not prev_cycle:
        prev_cycle = Cycle(
            name="FY 2025-26",
            year=2025,
            goal_setting_open=date(2025, 5, 1),
            goal_setting_close=date(2025, 6, 15),
            q1_open=date(2025, 7, 1),
            q1_close=date(2025, 9, 30),
            q2_open=date(2025, 10, 1),
            q2_close=date(2025, 12, 31),
            q3_open=date(2026, 1, 1),
            q3_close=date(2026, 3, 31),
            q4_open=date(2026, 4, 1),
            q4_close=date(2026, 6, 30),
            is_active=False
        )
        db.add(prev_cycle)
        db.flush()
    db.commit()

    print("Seeding Sample Goals for Active Cycle...")
    # Anjali's goals (Sales)
    anjali = users["anjali.iyer@atomberg.com"]
    anjali_goals_data = [
        ("Achieve Q1 sales target of ₹50L", UoMType.NUMERIC_MIN, 5000000, 15, "Sales Revenue"),
        ("Maintain customer NPS above 8.5", UoMType.NUMERIC_MIN, 8.5, 20, "Customer NPS"),
        ("Zero safety incidents this year", UoMType.ZERO, 0, 10, "Safety"),
        ("Reduce dealer TAT to 2 days", UoMType.NUMERIC_MAX, 2, 20, "On-time Delivery"),
        ("Onboard 15 new dealers", UoMType.NUMERIC_MIN, 15, 20, "Sales Revenue"),
    ]
    for title, uom, target, weight, ta_name in anjali_goals_data:
        goal = Goal(
            employee_id=anjali.id,
            cycle_id=active_cycle.id,
            thrust_area_id=thrust_areas[ta_name].id,
            title=title,
            uom_type=uom,
            target_value=target,
            weightage=weight,
            status=GoalStatus.LOCKED
        )
        db.add(goal)

    # Arjun's goals (R&D)
    arjun = users["arjun.mehta@atomberg.com"]
    arjun_goals_data = [
        ("Complete 3 BLDC motor prototype iterations", UoMType.NUMERIC_MIN, 3, 30, "Innovation & R&D"),
        ("Reduce production defect rate below 2%", UoMType.PERCENT_MAX, 2, 30, "Product Quality"),
        ("Launch new fan SKU by Sep 30", UoMType.TIMELINE, None, 25, "Innovation & R&D"),
        ("Zero critical bugs in firmware release", UoMType.ZERO, 0, 15, "Product Quality"),
    ]
    for title, uom, target, weight, ta_name in arjun_goals_data:
        goal = Goal(
            employee_id=arjun.id,
            cycle_id=active_cycle.id,
            thrust_area_id=thrust_areas[ta_name].id,
            title=title,
            uom_type=uom,
            target_value=target,
            target_date=date(2026, 9, 30) if uom == UoMType.TIMELINE else None,
            weightage=weight,
            status=GoalStatus.LOCKED
        )
        db.add(goal)
    
    print("Seeding Previous Cycle Data (FY 2025-26)...")
    # Seed Vikram with historical data
    vikram = users["vikram.singh@atomberg.com"]
    vikram_hist_goal = Goal(
        employee_id=vikram.id,
        cycle_id=prev_cycle.id,
        thrust_area_id=thrust_areas["Sales Revenue"].id,
        title="Annual Sales Target FY25",
        uom_type=UoMType.NUMERIC_MIN,
        target_value=10000000,
        weightage=100,
        status=GoalStatus.LOCKED
    )
    db.add(vikram_hist_goal)
    db.flush()
    
    # Achievements for FY25
    for q in [Quarter.Q1, Quarter.Q2, Quarter.Q3, Quarter.Q4]:
        ach = Achievement(
            goal_id=vikram_hist_goal.id,
            quarter=q,
            actual_value=2500000, # 25% each quarter
            status=AchievementStatus.COMPLETED,
            score_percent=100.0
        )
        db.add(ach)

    print("Seeding Shared Goal...")
    sales_emails = ["anjali.iyer@atomberg.com", "vikram.singh@atomberg.com", "sneha.patel@atomberg.com"]
    shared_goals = []
    primary_sales_goal = None
    
    for email in sales_emails:
        u = users[email]
        is_primary = (email == "anjali.iyer@atomberg.com")
        sg = Goal(
            title="Dept-wide: Q3 Sales Revenue ₹2 Cr collectively",
            uom_type=UoMType.NUMERIC_MIN,
            target_value=20000000,
            weightage=15,
            thrust_area_id=thrust_areas["Sales Revenue"].id,
            cycle_id=active_cycle.id,
            employee_id=u.id,
            is_shared=True,
            is_shared_primary=is_primary,
            status=GoalStatus.LOCKED
        )
        db.add(sg)
        db.flush()
        shared_goals.append(sg)
        if is_primary:
            primary_sales_goal = sg
            
    for g in shared_goals:
        g.shared_parent_id = primary_sales_goal.id

    db.commit()
    print("Seeding complete!")
    db.close()

if __name__ == "__main__":
    seed()
