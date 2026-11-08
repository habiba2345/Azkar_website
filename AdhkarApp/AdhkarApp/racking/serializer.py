from rest_framework import serializers
from .models import *
class userprogress(serializers.ModelSerializer):
    adhkar_title = serializers.ReadOnlyField(source='adhkar.title') # لإظهار اسم الذكر
    class Meta:
        model=UserProgress
        fields = ['adhkar','adhkar_title','points_earned', 'completed_at'] 
        # الحقول دي السيرفر هو اللي بيملأها، المستخدم ملوش دعوة بيهاع نمنع الهاكر يدخل رقم كبير ويزود الاسكور بتاعه
        read_only_fields = ['points_earned', 'completed_at']
class NotificationSerializer(serializers.ModelSerializer):
    # علامة صح للفرونت: هل التذكير ده اتبعت له إيميل النهاردة بالفعل؟
    sent_today = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        # 'id' مطلوب هنا حتى يقدر الـ frontend يبني روابط الحذف/التحديث
        # (/racking/notifications/<id>/) بشكل صحيح؛ بدونه كانت كل تذكير
        # بترجع من غير رقم تعريفي فتتحول الروابط إلى ".../undefined/" وتفشل بـ 404.
        fields = ['id', 'title', 'is_enabled', 'reminder_time', 'sent_today']

    def get_sent_today(self, obj):
        from django.utils import timezone
        return obj.last_sent_date == timezone.localdate()