from django.core.management.base import BaseCommand

from racking.reminders import send_due_reminders


class Command(BaseCommand):
    """
    بيبعت إيميلات التذكيرات اللي وقتها دلوقتي. شغّله كل دقيقة عن طريق cron
    (أو أي scheduler تاني) لو مش شغال السيرفر بـ `manage.py runserver`
    (اللي بيشغّل نفس الحاجة تلقائيًا في الخلفية عن طريق apscheduler):

        * * * * * cd /path/to/AdhkarApp && python manage.py send_reminder_emails
    """

    help = 'يبعت إيميل لأي تذكير مفعّل وقته دلوقتي ولسه ما اتبعتش عنه إيميل النهاردة.'

    def handle(self, *args, **options):
        sent_count = send_due_reminders()
        self.stdout.write(self.style.SUCCESS(f'تم إرسال {sent_count} إيميل تذكير.'))
