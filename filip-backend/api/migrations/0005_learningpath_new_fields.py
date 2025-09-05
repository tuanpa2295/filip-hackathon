from django.db import migrations, models
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_udemycourse'),
    ]

    operations = [
        migrations.AddField(
            model_name='learningpath',
            name='completed_hours',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='learningpath',
            name='end_date',
            field=models.DateField(default=datetime.date.today),
        ),
        migrations.AddField(
            model_name='learningpath',
            name='estimated_hours',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='learningpath',
            name='start_date',
            field=models.DateField(default=datetime.date.today),
        ),
    ]
