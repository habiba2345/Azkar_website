from django.db import migrations

FREE_CATEGORY_NAME = "ذكر حر"


def create_free_category(apps, schema_editor):
    # بننشئ قسم "ذكر حر" من الأول عشان يظهر في صفحة الأقسام حتى لو محدش
    # ضاف ذكر خاص لحد دلوقتي (بدل ما نستنى أول مستخدم يضيف ذكر عشان القسم يتعمل).
    Category = apps.get_model('adhkar', 'Category')
    if not Category.objects.filter(name=FREE_CATEGORY_NAME).exists():
        Category.objects.create(
            name=FREE_CATEGORY_NAME,
            description='اكتب أذكارك الخاصة، وهتظهر هنا لكل زوار الموقع',
        )


def reverse_noop(apps, schema_editor):
    # مش بنمسح القسم عند الرجوع بالميجريشن، تجنبًا لحذف أذكار المستخدمين المرتبطة بيه
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('adhkar', '0002_adhkar_owner'),
    ]

    operations = [
        migrations.RunPython(create_free_category, reverse_noop),
    ]
