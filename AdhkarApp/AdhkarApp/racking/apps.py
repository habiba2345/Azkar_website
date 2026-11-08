import os

from django.apps import AppConfig


class RackingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'racking'

    def ready(self):
        import racking.signals

        # وقت تشغيل `manage.py runserver` بيتعمل django.setup() مرتين: مرة في
        # عملية المراقبة (watcher) ومرة في العملية الحقيقية اللي بتخدم
        # الريكوستس، وDjango بيحط RUN_MAIN=true في العملية التانية بس. بنشغل
        # الـ scheduler هناك بس عشان ما يشتغلش مرتين (زي أي تطبيق
        # django-apscheduler عادي). لو السيرفر شغال بـ --noreload أو في
        # production (gunicorn وغيره) هتلاقي RUN_MAIN مش موجود أصلًا، وهنا
        # استخدم أمر `python manage.py send_reminder_emails` مع cron بدل ده،
        # عشان تتجنب تشغيل أكتر من scheduler لو عندك أكتر من worker process.
        if os.environ.get('RUN_MAIN') != 'true':
            return

        try:
            from apscheduler.schedulers.background import BackgroundScheduler
        except ImportError:
            # apscheduler مش متثبتة - التذكيرات هتتبعت بس لو شغّلت الأمر
            # `python manage.py send_reminder_emails` يدويًا أو عن طريق cron.
            return

        from .reminders import send_due_reminders

        scheduler = BackgroundScheduler(daemon=True)
        scheduler.add_job(
            send_due_reminders,
            'interval',
            minutes=1,
            id='send_due_reminders',
            replace_existing=True,
            max_instances=1,
        )
        scheduler.start()