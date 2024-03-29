# Generated by Django 4.0.1 on 2022-01-18 22:36

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

import main.utils


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Token',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(choices=[('email_confirmation', 'Email Confirmation')], max_length=32)),
                ('expiration', models.DateTimeField()),
                ('token', models.CharField(default=main.utils.build_token, max_length=256, unique=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tokens', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
