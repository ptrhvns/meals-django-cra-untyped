# Generated by Django 4.0.1 on 2022-02-03 21:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0003_alter_user_is_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='email_confirmed_datetime',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
