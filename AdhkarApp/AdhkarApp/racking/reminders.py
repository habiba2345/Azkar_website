"""
منطق إرسال إيميلات التذكير.

كل دقيقة (شوف apps.py و management/commands/send_reminder_emails.py) بنقارن
وقت كل تذكير مفعّل بالوقت الحالي، ولو اتساووا (لحد الدقيقة) وماكانش اتبعت
إيميل عن التذكير ده النهاردة، بنبعت إيميل ونسجل last_sent_date عشان:
1) ما نبعتش أكتر من إيميل واحد لنفس التذكير في نفس اليوم.
2) الفرونت يقدر يعرض علامة صح على التذكير اللي حصل النهاردة.
"""
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from .models import Notification


def send_due_reminders():
    now = timezone.localtime()
    today = now.date()
    due = (
        Notification.objects.filter(
            is_enabled=True,
            reminder_time__hour=now.hour,
            reminder_time__minute=now.minute,
        )
        .exclude(last_sent_date=today)
        .select_related('user')
    )

    sent_count = 0
    for reminder in due:
        recipient = reminder.user.email
        if not recipient:
            reminder.last_sent_date = today
            reminder.save(update_fields=['last_sent_date'])
            continue

        subject = 'حان وقت أذكارك 🌙'
        reminder_label = reminder.title.strip() if reminder.title else 'أذكارك'
        message = f'حان وقت: {reminder_label}\n\nافتح تطبيق أذكاري وسجّل إتمامك لهذا الذكر.'

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                fail_silently=True,
            )
            sent_count += 1
        finally:
            # بنسجل إنه اتبعت حتى لو فشل الإرسال، عشان ما نكررش المحاولة كل
            # دقيقة على نفس التذكير طول اليوم.
            reminder.last_sent_date = today
            reminder.save(update_fields=['last_sent_date'])

    return sent_count
